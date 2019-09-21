//getnews() function for getting news from NEWS API.org using API key

getnews();
function getnews(){
    var url = 'https://newsapi.org/v2/everything?' +
    'q=coding&' +
    'language=en&' +
    'sortBy=popularity&' +
    'pageSize=50&' +
    'apiKey=8c0f75787bcb4282809ecfaabcca74bd';
var req = new Request(url);

//sending request for fetching news data
fetch(req)
    .then(function(response) {
        response.json().then(function(data){
            console.log(data);
            data.articles.forEach(function(element,index) {
                if(index===0)
                    document.getElementById("getnews").innerHTML+='<div class="carousel-item active"><div class="card"><img class="card-img-top" src="'+element.urlToImage+'" alt="'+element.title+'"><div class="card-body"><h5 class="card-title">'+element.title+'</h5><p class="card-text">'+element.description+'</p> <a href="'+element.url+'" class="btn btn-primary">Go to '+element.source.name+'</a></div></div></div>';
                else
                document.getElementById("getnews").innerHTML+='<div class="carousel-item"><div class="card"><img class="card-img-top" src="'+element.urlToImage+'" alt="'+element.title+'"><div class="card-body"><h5 class="card-title">'+element.title+'</h5><p class="card-text">'+element.description+'</p> <a href="'+element.url+'" class="btn btn-primary">Go to '+element.source.name+'</a></div></div></div>';

            
            });

        });
    })

}
