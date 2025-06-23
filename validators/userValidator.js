import Joi from "joi";

export const userValidator = {
  validateUpdatePassword: Joi.object({
    passwordCurrent: Joi.string().required().min(8).label("current password"),
    password: Joi.string().required().min(8).label("password"),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .label("password confirm")
      .messages({ "any.only": "passwordConfirm does not match password" }),
  })
    .unknown(false)
    .messages({ "any.unknown": "{{$label}} field is not allowed" }),
};
