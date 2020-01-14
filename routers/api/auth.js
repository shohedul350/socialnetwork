const router=require('express').Router()
const {check,validationResult}=require('express-validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const User=require('../../models/User')
const authentication=require('../../middleware/authenticate')

//@route get api/auth
//@desc Test route
//@access Public
router.get('/',authentication,(req,res)=>{
  User.find().select('-password')
  .then(users=>{
    res.status(200).json(users)
  })
  .catch(error=>{res.status(500).json({massage:"server error ",error})})
      
})
    
//@route post api/auth
//@desc Authentication & get token
//@access Public
router.post('/',

[

    check('email','please include valid email').isEmail(),

    check('password','password is requerd').exists()
],

(req,res)=>{
  const errors=validationResult(req);
        if(!errors.isEmpty()){
          return res.status(400).json({
            errors:errors.array()
          });
  }
  const{email,password}=req.body;

  User.findOne({email})
          //use populate for transaction
          .then(user=>{
          
            if(!user){
              return res.status(400).json({massage:"user not found"})
            }

            bcrypt.compare(password,user.password,(err,result)=>{
               if(err){
                 res.status(500).json({
                   massage:"server error bcrypt"
                 })
               }

               if(!result){
                 return      res.status(400).json({
                   massage:"password doesnot match"
                 })
               }

              let token =jwt.sign({
                _id: user._id,
                name: user.name,
                email: user.email,
                
              },'SECRET',{expiresIn:'24h'})
               res.status(200).json({
                 massage:"login succesfull",
                 token:`Bearer ${token}`
               })

            })
          })
          .catch(error=>{
            res.status(500).json({massage:"server error bahire",error})
          })
        }

);

module.exports=router