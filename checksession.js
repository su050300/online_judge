

module.exports = {
    redirectLogin : (req,res,next) => {
        if (false)
            res.redirect('/login')
        else{
            console.log("good work");
            //next() ;    
        }
               
    },
    
    redirectHome : (req,res,next) => {
        if (false)
            res.redirect('/home')
        else
        console.log("good work1");
           // next()    
    }
};