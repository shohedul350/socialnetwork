const mongoose=require('mongoose')
const Schema=mongoose.Schema


const profileSchema=new Schema({
    
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    company:{
        type:String
    },
    website:{
        type:String
    },
    location:{
        type:String
    },
    status:{
        type:String
    },
    skills:{
        type:[String],
        required:true
    },
    bio:{
        type:String
    },
    githubusername:{
        type:String
    },
    
    experience:[
        {
          title:{
              type:String,
              require:true
          } ,
          company:{
            type:String
        },
       
        location:{
            type:String
        },
        from:{
            type:Date,
            require:true
        },
        to:{
            type:Date
        },
        current:{
            type:Boolean,
            default:false
        },
        description:{
            type:String
        }
        }
    ],
    education:[
        {
        school:{
            type:String,
            require:true
        },
        degree:{
            type:String,
            require:true
        },
        fieldofstudy:{
            type:String,
            require:true
        },
        from:{
            type:Date,
            require:true
        },
        to:{
            type:Date
        },
        current:{
            type:Boolean,
            default:false
        },
        description:{
            type:String
        }
        }
    ],
    social:{
        youtube:{
              type:String
        },
        twitter:{
            type:String
        },
        facebook:{
            type:String
        },
        linkedin:{
            type:String
        },
        instragram:{
            type:String
        }
    },
    date:{
        type:Date,
        default:Date.now
    }
});

const Profile =mongoose.model('Profile',profileSchema)
module.exports=Profile

