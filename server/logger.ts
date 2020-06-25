import winston from 'winston';
import util from 'util';
import chalk from 'chalk';

const { format } = winston;

type Message = {
  event?: string;
  socket?: string;
  line: any;
  roomId?: string;
};

const DEFAULT_EVENT = 'general';

const logger = winston.createLogger({
  level: 'info',
  format: format.timestamp(),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((l) => {
          const m: any = l.message;
          let { event, socket, roomId } = m;
          let output = '';
          if (m.event === 'say') {
            output = `${chalk.bold(m.line.username)}: ${chalk.blueBright(
              m.line.message
            )}`;
          } else {
            const m_ = { ...m };
            delete m_.event;
            delete m_.socket;
            output = util.inspect(m_, {
              colors: true,
              depth: 2,
              breakLength: Infinity,
            });
            if (output === '{}') {
              output = '';
            }
          }
          event = event || DEFAULT_EVENT;
          switch (event) {
            case 'connection': {
              event = chalk.cyanBright(event);
              break;
            }
            case 'join': {
              event = chalk.cyanBright(event);
              break;
            }
            case 'closure': {
              event = chalk.redBright(event);
              break;
            }
          }

          socket = socket ? `[${socket.substr(0, DEFAULT_EVENT.length)}] ` : '';
          roomId = roomId ? `[${roomId}] ` : '';

          return `${l.timestamp} [${l.level}] ${roomId}${socket}[${event}] ${output}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: format.json(),
    }),
  ],
});

export default logger;
