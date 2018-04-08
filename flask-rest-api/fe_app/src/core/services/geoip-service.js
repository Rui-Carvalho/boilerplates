const GEOIP_URL = 'https://freegeoip.net/json/';

export default class GeoIPService {

    static getCountryForUser() {
        return fetch(GEOIP_URL)
        .then(response => response.json())
        .catch(error => {
            console.dir(error);
        });
    }
}
