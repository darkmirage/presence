import socketClusterClient, { AGClientSocket } from 'socketcluster-client';

const PRODUCTION = process.env.NODE_ENV === 'production';
const HOSTNAME = PRODUCTION ? 'server.wireplace.net' : 'mirai';
const PORT = PRODUCTION ? 8081 : 8000;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export type FacePose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

class RTCClient {
  socket: AGClientSocket;
  connection: RTCPeerConnection;
  channel: RTCDataChannel;
  _decoder: TextDecoder;
  _handlePose: (data: FacePose) => void;
  _handleDisconnected: () => void;

  constructor(onPose: (data: FacePose) => void, onDisconnected: () => void) {
    this.socket = socketClusterClient.create({
      hostname: HOSTNAME,
      port: PORT,
      autoConnect: false,
    });
    this.connection = new RTCPeerConnection();
    this.channel = this.connection.createDataChannel('dummy');
    this._handlePose = onPose;
    this._handleDisconnected = onDisconnected;
    this._decoder = new TextDecoder('ascii');
  }

  onPose(onPose: (pose: FacePose) => void) {
    const current = this._handlePose;
    this._handlePose = (pose: FacePose) => {
      current(pose);
      onPose(pose);
    };
  }

  handleConnectionStateChange = () => {
    console.log('[RTCClient]', this.connection.connectionState);
    if (this.connection.connectionState === 'disconnected') {
      this._handleDisconnected();
    }
  };

  handleMessage = (event: MessageEvent) => {
    const text = this._decoder.decode(event.data);
    const p: FacePose = JSON.parse(text);
    this._handlePose(p);
  };

  handleOpen = () => {
    console.log('[RTCClient]', 'Channel opened');
  };

  registerChannel(channel: RTCDataChannel) {
    this.channel = channel;
    channel.addEventListener('open', this.handleOpen);
    channel.addEventListener('message', this.handleMessage);
  }

  createConnection(channelId: string) {
    console.log('[RTCClient]', 'Reseting RTC connection and channel');
    const connection = new RTCPeerConnection(configuration);

    connection.addEventListener('icecandidate', (event) => {
      const { candidate } = event;
      if (candidate) {
        this.socket.transmitPublish('icecandidate:' + channelId, { candidate });
      }
    });
    connection.addEventListener(
      'connectionstatechange',
      this.handleConnectionStateChange
    );
    connection.addEventListener('datachannel', (event) => {
      this.registerChannel(event.channel);
    });

    this.connection = connection;
  }

  async connect(channelId: string) {
    (async () => {
      const channel = this.socket.subscribe('icecandidate:' + channelId);
      for await (let { candidate } of channel) {
        console.log('[RTCClient]', 'Recieved ICE candidate');
        try {
          if (candidate) {
            await this.connection.addIceCandidate(candidate);
          }
        } catch (error) {}
      }
    })();

    this.createConnection(channelId);
    const channel = this.connection.createDataChannel('sendChannel');
    this.registerChannel(channel);

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    const data = { channelId, offer };
    const result = await this.socket.invoke('signal', data);

    if (result) {
      this.channel.close();
      this.connection.close();

      this.createConnection(channelId);
      this.connection.setRemoteDescription(result.offer);
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);

      await this.socket.transmitPublish('answer:' + channelId, { answer });
    } else {
      (async () => {
        const channel = this.socket.subscribe('answer:' + channelId);
        for await (let { answer } of channel) {
          const remoteDescription = new RTCSessionDescription(answer);
          await this.connection.setRemoteDescription(remoteDescription);
        }
      })();
    }

    return new Promise((resolve) => {
      const check = () => {
        if (this.connection.connectionState === 'connected') {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}

export default RTCClient;
