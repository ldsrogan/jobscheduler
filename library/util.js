import os from 'os';
import crypto from 'crypto';
import logger from './logger';

const ipAddress = () => {
  const ifaces = os.networkInterfaces();
  let publicIP = '';
  Object.keys(ifaces).forEach((ifname) => {
    let alias = 0;
    ifaces[ifname].forEach((iface) => {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        // console.log(`${ifname}:${alias}`, iface.address);
      } else {
        // this interface has only one ipv4 adress
        // console.log(ifname, iface.address);
      }
      if (iface.address !== '') {
        publicIP = iface.address;
      }
      alias += 1;
    });
  });

  return publicIP;
  // en0 192.168.1.101
  // eth0 10.0.0.101
};

const uuid = () => {
  return crypto.randomBytes(16).toString('base64');
};

export { ipAddress, uuid };
