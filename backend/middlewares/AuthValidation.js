const joi = require("joi");

const SignupValidation = (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(3).max(10).required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(10).required()
    });
    
    const { error } = schema.validate(req.body);

    if(error){
        return res.status(400)
        .json({message:"invalid feilds" ,error})
    }
    next();
}

const LoginValidation = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(10).required(),
        role: joi.string().valid('student', 'driver', 'admin').required()
    });
    
    const { error } = schema.validate(req.body);

    if(error){
        return res.status(400)
        .json({message:"bad reqest" ,error})
    }
    next();
}

module.exports={LoginValidation , SignupValidation};



