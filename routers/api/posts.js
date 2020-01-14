const router=require('express').Router()

const authenticaton=require('../../middleware/authenticate')
const profileModel=require('../../models/Profile')
const usermodel=require('../../models/User')
const postModel=require('../../models/Post')
const { check, validationResult } = require('express-validator');

//@route Post api/posts
//@desc create a route
//@access Public
router.post('/',
[authenticaton,
    [
   check('text','Text is require')
   .not()
   .isEmpty()
    ]]
,(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        errors:errors.array()
      });
}
 
  usermodel.findById(req.user.id).select('-password')
  .then(user=>{
   
    
    const newPost=new postModel({
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    })
   
    newPost.save()
    .then(result=>{
        res.send(result)
    })
    .catch(error=>{
        res.status(400).json({msg:'server error'})
    })

  })
  .catch(erroe=>{
      res.status(400).json({msg:'server error '})
  })
   
})
    
//@route GET api/posts
//@desc Get All Posts
//@access Pprivet

router.get('/',authenticaton,(req,res)=>{
  postModel.find().sort({date: -1})
  .then(posts=>{
    res.send(posts)
  })
  .catch(error=>{
    res.status(400).json({msg:"server error"})
  })
})

//@route GET api/post/:id
//@desc Get post by id
//@access privet

router.get('/:id',authenticaton,(req,res)=>{
  
  postModel.findById(req.params.id)
  .then(post=>{

    if(!post){
      return res.status(404).json({msg:"post not Found"})
    }
    res.send(post)
  })
  .catch(error=>{
    
    if(error.kind==='ObjectId'){
      return res.status(404).json({msg:"post not Found"})
    }
    res.status(400).json({msg:"server error"})
  })
})


//@route Delete api/posts
//@desc Delete a  Posts
//@access Privet

router.delete('/:id',authenticaton,(req,res)=>{

  //check user
  postModel.findById(req.params.id)
  .then(post=>{
    if(!post){
      return res.status(404).json({msg:"post not Found"})
    }
    if(post.user.toString()!==req.user.id){
      res.status(401).json({mas:"User not Authorize"})
    }
    post.remove()
       .then(()=>{
        res.json({msg:'post Removed'})
       })
       .catch(error=>{
        res.status(400).json({msg:"server error"})
      })
    
  })
  .catch(error=>{
    if(error.kind==='ObjectId'){
      return res.status(404).json({msg:"post not Found"})
    }
    res.status(400).json({msg:"server error"})
  })
})



//@route Delete api/posts/like/:id
//@desc like  a  Posts
//@access Privet
router.put('/like/:id',authenticaton,(req,res)=>{
 
  postModel.findById(req.params.id)
  .then(post=>{
   console.log(post)
    //check if the post already liked
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
        return res.status(400).json({msg:"post already liked"})
    }
    post.likes.unshift({user:req.user.id});
    post.save()
        .then(post=>{
          res.send(post)
        })
        .catch(error=>{
          res.status(400).json({msg:"server error"})
        })
  })
  .catch(error=>{
        if(error.kind==='ObjectId'){
          return res.status(404).json({msg:"post not Found"})
        }
        res.status(400).json({msg:"server error bahir"})
      })
})

//@route Delete api/posts/unlike/:id
//@desc like  a  Posts
//@access Privet
router.put('/unlike/:id',authenticaton,(req,res)=>{
  
  postModel.findById(req.params.id)
  .then(post=>{
    console.log(post.likes)
    //check if the post already liked
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
        return res.status(400).json({msg:"post has not yet been liked"})
    }
   // get remove index
   const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id);

   post.likes.splice(removeIndex, 1);
    post.save()
        .then(post=>{
          res.send(post.likes)
        })
        .catch(error=>{
          res.status(400).json({msg:"server error"})
        })
  })
  .catch(error=>{
        if(error.kind==='ObjectId'){
          return res.status(404).json({msg:"post not Found"})
        }
        res.status(400).json({msg:"server error"})
      })
})


//@route Post api/posts/comment
//@desc comment on a post
//@access Privet
router.post('/comment/:id',
[authenticaton,
    [
   check('text','Text is require')
   .not()
   .isEmpty()
    ]]
,(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        errors:errors.array()
      });
}
 
  usermodel.findById(req.user.id).select('-password')
  
    .then(user=>{
        const newComment=new postModel({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
            })
        //  console.log(newComment)
               //find comment array
              
               postModel.findById(req.params.id)
                  .then(post=>{
                   
              

                      post.comments.unshift(newComment)
                      post.save()
                          .then(post=>{
                          res.send(post)
                          })
            
                          .catch(error=>{res.status(400).json({msg:'server error'}) })
                    })
                  
                
                  .catch(error=>{res.status(400).json({msg:'post not found',error})})
                //end comment array


         })
   .catch(erroe=>{ res.status(400).json({msg:'server error '}) })


     
})
   


//@route Post api/posts/comment/:id/:comment_id
//@desc delete a comment
//@access Privet


router.delete('/comment/:id/:comment_id',authenticaton,(req,res)=>{
  postModel.findById(req.params.id)
  .then(post=>{
    //pull out comment

   const comment=post.comments.find(comment=>comment.id===req.params.comment_id)

   //make sure comment exits
   if(!comment){
     return res.status(404).json({msg:"comment dose not exits"})
   }
//check the user
if(comment.user.toString() !== req.user.id){
  return res.status(404).json({msg:"User not Authorize"})
}
  // get remove index
  const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);

  post.comments.splice(removeIndex, 1);
   post.save()
       .then(post=>{
         res.send(post.comments)
       })

  }) 
})
module.exports=router