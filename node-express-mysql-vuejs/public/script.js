new Vue({
    el: '#app',
    data: {
        somethingList: [
            {name: 'USD'},
            {name: 'GBP'}
        ]
    },
    methods: {
        methodAPI: () => {
            console.log('Fetching all somethings...');
            this.somethingList = [
                {name: 'HELLO'},
                {name: 'WORLD'}
            ];
        }
    }
});