if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb+srv://HapShapIncorporated:nitsujSHAPPY2298@@(*@web-api-for-games-f34dp.mongodb.net/test?retryWrites=true'}
}
else{
    module.exports = {mongoURI: 'mongodb://localhost:27017/gameentries'}
}