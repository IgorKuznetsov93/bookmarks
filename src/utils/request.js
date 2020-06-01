import request from 'request';
import cheerio from 'cheerio';
import http from '../../config/http';

export async function getOpenGraphMetaProperties(url) {
  const desiredProperties = ['og:title', 'og:image', 'og:description'];
  const response = await new Promise((resolve, reject) => {
    request.get({
      url,
      timeout: http[process.env.NODE_ENV].requestTimeout,
    }, (err, res) => {
      err ? reject(new Error('Error getting OG preview')) : resolve(res);
    });
  });
  const $ = cheerio.load(response.body);
  const meta = $('meta');
  const keys = Object.keys(meta);
  const metaData = {};
  keys.forEach((key) => {
    const { attribs } = meta[key];
    if (attribs && attribs.property && attribs.content && desiredProperties.indexOf(attribs.property) !== -1) {
      metaData[attribs.property] = attribs.content;
    }
  });
  if (Object.keys(metaData).length !== desiredProperties.length) {
    throw new Error("the bookmark doesn't have all the necessary open graph meta properties");
  }
  return metaData;
}

export async function getWhoIsInformation(url) {
  const rootDomain = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i)[1].split('.').slice(-2).join('.');
  console.log(rootDomain)
  const response = await new Promise((resolve, reject) => {
    request.get({
      url: `https://htmlweb.ru/analiz/api.php?whois&url=${rootDomain}&json`,
      timeout: http[process.env.NODE_ENV].requestTimeout,
    }, (err, res) => {
      err ? reject(new Error('Error getting whoIs information')) : resolve(res);
    });
  });
  if (!response || response.statusCode !== 200) {
    throw Error('Error getting whoIs information');
  }
  return response.body;
}
