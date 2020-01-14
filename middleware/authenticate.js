const passport=require('passport')

module.exports=(req,res,next)=>{
    passport.authenticate('jwt',(err,user,info)=>{
        if(err){
            console.log(info)
            console.log(error)
            return next(err)
        }

        if(!user){
            res.status(400).json({
               massage:'Authentication Failed ..' 
            })
        }

        req.user=user
       return next()
     })(req,res,next)
}