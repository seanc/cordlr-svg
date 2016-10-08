const svgToPng = require('svg2png');
const path = require('path');
const request = require('request');
const validUrl = require('valid-url');

function svg(bot, config) {
  config = config[svg.name] || {}
  const max = config.max === 'Infinity' ? Infinity : config.max || 6;

  return function run(message, args) {
    if (!args.length) return message.reply('You need to provide at least one url');
    const urls = args.filter(url => validUrl.isUri(url));

    if (urls.length > max) {
      return message.reply(`You can only convert ${max} images at a time`);
    }

    urls.forEach(url => {
      if (['.png', '.jpg', '.jpeg'].indexOf(path.extname(url)) > -1) {
        return message.reply(`The image \`${path.basename(url)}\` has already been converted`);
      }

      if (path.extname(url) !== '.svg') {
        return message.reply('That image is not in svg format');
      }

      request(url, (err, res, body) => {
        if (err) {
          message.reply('An error occured while trying to convert the image to png.')
          return console.log(err);
        }

        svgToPng(new Buffer(body.trim()))
        .then(buffer => message.channel.sendFile(buffer))
        .catch(err => {
          console.log(err);
          message.reply('An error occured while trying to convert the image to png.');
        });
      });
    });
  }
}

svg.command = 'svg';
svg.usage = 'svg <...urls>';

module.exports = svg;
