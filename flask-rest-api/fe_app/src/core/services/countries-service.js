export default class CountriesService {

    static listOfCountries = {};

    static loadListOfCountries()
    {
        return fetch(COUNTRIES_URL, {
            method: 'get',
            headers: {
                'Accept'      : 'application/json; charset=utf-8',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            CountriesService.listOfCountries = data;
            return data;
        })
        .catch(error => {
            console.dir(error);
        });
    }

    //TODO: finish this implementation using listOfCountries and loadListOfCountries
    static getListOfCountries()
    {
        return CountriesService.loadListOfCountries();
        // if(CountriesService.listOfCountries === {}) {
        //     CountriesService.loadListOfCountries();
        // }
    }

    //TODO: finish this implementation using listOfCountries and loadListOfCountries
    static isValidCountryISO(country_iso)
    {
        if(!country_iso) return false;
        return true;
    }
}
