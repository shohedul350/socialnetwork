const router=require('express').Router()
const authenticaton=require('../../middleware/authenticate')
const profileModel=require('../../models/Profile')
const usermodel=require('../../models/User')
const { check, validationResult } = require('express-validator');
//@route get api/profile/me
//@desc Get current users profile
//@access privet
router.get('/me',authenticaton,(req,res)=>{

profileModel.findOne({user:req.user.id}).populate('user',['name','avatar'])
.then(result=>{
    if(!result){
        return res.status(400).json({msg:'there is no profile for this user'})
        
    }
    
    res.json(result);
})
.catch(error=>{
    res.status(500).json({massage:"server error",error})
  })
}) 



//@route post api/profile
//@desc create or update profile
//@access privet


router.post('/',

[authenticaton,[

    check('status','status is require').not().isEmpty(),

    check('skills','skills is require').not().isEmpty(),
]],

(req,res)=>{
  const errors=validationResult(req);
        if(!errors.isEmpty()){
          return res.status(400).json({
            errors:errors.array()
          });
  }

    

 const {company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instragram,linkedin}=req.body
 //bulid profile object
   const profileField={};
  profileField.user=req.user.id;

   if (company) profileField.company=company;
   if(website) profileField.website=website;
   if (location) profileField.location=location;
   if(bio) profileField.bio =bio;
   if(status) profileField.status=status;
   if(githubusername) profileField.githubusername=githubusername;

   if (skills){
       profileField.skills=skills.split(',').map(skill=>
       skill.trim() )};
      


  //bulid profile object
   profileField.social={}

   if(youtube)profileField.social.youtube=youtube;
   if(twitter)profileField.social.twitter=twitter;
   if(facebook)profileField.social.facebook=facebook;
   if(linkedin)profileField.social.linkedin=linkedin;
   if(instragram)profileField.social.facebook=instragram;

   profileModel.findOne({user:req.user.id})
   .then(profile=>{
     if(profile){
     profileModel.findOneAndUpdate(
         {user:req.user.id},
         {$set:profileField},
         {new:true}
       )
       .then(updateresult=>{
        return res.status(200).json({massage:'update',updateresult})
       })
       .catch(err=>{
        console.log(err);
        res.status(500).send('not update server error')
      })
      
     
    
      
     }
 
    
            //create
          if(!profile){
            profile=new profileModel(profileField)
            profile.save()
            .then(result=>{
              res.send('profile create succesfull',result)
            })
            .catch(err=>{
              res.status(400).json({massage:'profile create not sccesfull'})
            })
          }  
   })
   .catch(err=>{
     console.log(err);
     res.status(500).send('server error')
   })
   

});


//@route get api/profile
//@desc get all profile 
//@access public

router.get('/',(req,res)=>{
 
profileModel.find().populate('user',['name','avatar'])
.then(profiles=>{
  res.json(profiles)
})
.catch(error=>{
  res.status(400).json('server error')
  console.log(error)
})

})


//@route get api/profile/user/user_id
//@desc get profile by user id
//@access public

router.get('/user/:user_id',(req,res)=>{



  profileModel.findOne({user:req.params.user_id}).populate('user',['name','avatar'])

  .then(profile=>{
      if(!profile){
        return res.status(400).json({msg:" profile not found"})
      }
        res.send(profile)
    
   
     
  })
  .catch(error=>{
    if(error.kind=='ObjectId'){
      res.status(400).json('Profile not found')
    }
    res.status(400).json('server error')
  
  })
  
  })


  //@route Delete api/profile
//@desc Delete profile user & post
//@access privet

router.delete('/',authenticaton,(req,res)=>{
   
  //@todo  remove userpost

  //remove profile
  profileModel.findOneAndRemove({user:req.user.id})
  //remove user
  usermodel.findOneAndRemove({_id:req.user.id})
  .then(res.json({msg:"User Delete"}))
  .catch(error=>{
    res.status(400).json('server error')
   
  })
  
  })


//@route PUT api/profile/exprience
//@desc Add profile exprience
//@access privet


router.put('/experience',
[authenticaton,
  [
    check('title','title is require')
    .not()
    .isEmpty(),
    check('company','company is require')
    .not()
    .isEmpty(),
    check('from','From date is require')
    .not()
    .isEmpty(),

  ]],
  (req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
return res.status(400).json({errors:errors.array()})
  }
const {title,company,location,from,to,current,description}=req.body

const newExp={
  title,
  company,
  location,
  from,
  to,
  current,
  description
}

profileModel.findOne({user:req.user.id})
.then(profile=>{
  

    profile.experience.unshift(newExp);
   
    profile.save()
    .then(result=>{
      
      res.status(200).json({msg:"experience save succesfull",result})
    })
    .catch(error=>{
      res.status(5000).json({msg:'server error',error})
    })
  
})
.catch(error=>{
res.status(500).send('server error bahire')
console.log(error)
})


});



//@route Delete api/profile/exprience/:_id
//@desc delete  exprience from profile
//@access privet
router.delete('/experience/:exp_id',authenticaton,(req,res)=>{
 
 
  profileModel.findOne({user:req.user.id})
  .then(profile=>{
  
    const removeIndex=profile.experience
    .map(item=>item.id)
    .indexOf(req.params.exp_id);
   
    profile.experience.splice(removeIndex,1);
    profile.save()
            .then(result=>{
              res.send(result)
            })
            .catch(error=>{
              res.status(500).json({msg:"experience not delete"})
            })
  })
  .catch(error=>{
    res.status(500).json({msg:"server error bahire"})
  })
})


//.............................................
//@route PUT api/profile/education
//@desc Add profile education
//@access privet


router.put('/education',
[authenticaton,
  [
    check('school','School is require')
    .not()
    .isEmpty(),
    check('degree','Degree is require')
    .not()
    .isEmpty(),
    

  ]],
  (req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
return res.status(400).json({errors:errors.array()})
  }
const { school,degree,fieldofstudy,from,to,current,description}=req.body

const newEdu={
  school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
}

profileModel.findOne({user:req.user.id})
.then(profile=>{
  

    profile.education.unshift(newEdu);
   
    profile.save()
    .then(result=>{
      
      res.status(200).json({msg:"education save succesfull",result})
    })
    .catch(error=>{
      res.status(5000).json({msg:'server error'})
    })
  
})
.catch(error=>{
res.status(500).send('server error bahire')
console.log(error)
})


});



//@route Delete api/profile/education/:_id
//@desc delete  education from profile
//@access privet
router.delete('/education/:edu_id',authenticaton,(req,res)=>{
 
 
  profileModel.findOne({user:req.user.id})
  .then(profile=>{
  
    const removeIndex=profile.education
    .map(item=>item.id)
    .indexOf(req.params.edu_id);
   
    profile.education.splice(removeIndex,1);
    profile.save()
            .then(result=>{
              res.send(result)
            })
            .catch(error=>{
              res.status(500).json({msg:"education not delete"})
            })
  })
  .catch(error=>{
    res.status(500).json({msg:"server error "})
  })
})
module.exports=router