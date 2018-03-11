module.exports = (app, path, logic, db) => {

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });

    app.get('/api/currencies', (req, res, next) => {
        logic.metho1(db.conQA).then((results) => {
            res.status(200).send(results);
        });
    });

    app.get('/search/:query', function(req, res) {
        ajax.get('gallery/search/top/0/?' + querystring.stringify({ q: req.params.query }))
            .then(function (result) {
                res.send(result.data.data.filter(item => !item.is_album && !item.nsfw && !item.animated));
            })
            .catch(function (error) {
                console.log(error);
            });
    });


};