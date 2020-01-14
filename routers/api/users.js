const router=require('express').Router()

const {check,validationResult}=require('express-validator')
const User=require('../../models/User')
var gravatar = require('gravatar')
const bcrypt=require('bcryptjs')

//@route post api/users
//@desc Register user
//@access Public
router.post('/',

[
    check('name','Name is require')
    .not()
    .isEmpty(),

    check('email','please include valid email')
    .isEmail(),

    check('password',
    'please enter a password with 6 or more characters'
    ).isLength({min:6})
],

(req,res)=>{
  const errors=validationResult(req);
        if(!errors.isEmpty()){
          return res.status(400).json({
            errors:errors.array()
          });
  }
  const{name,email,password}=req.body;
  User.findOne({ email })
  .then(user => {
      if (user) {
           return res.status(400).json({errors:[{msg:'email already exists'}]}) 
      };

      
      const avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});

      bcrypt.hash(password, 11, (err, hash) => {
          if (err) {
              return  res.status(400).send('server Error vitore');
          }

          let user = new User({
              name,
              email,
              avatar,
              password: hash,
             
          })
      

          user.save()
              .then(user => {
                  res.status(201).json({
                      message: 'User Created Successfully',
                      user
                  })
              })
              .catch(err=>{
                console.log(err.massage);
                 res.status(400).send('server Error vitore');
             })
      })
  })
  .catch(err=>{
            console.log(err.massage);
             res.status(400).send('server Error bahire');
         })
}

);




     

module.exports=router

