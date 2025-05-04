import Joi from "joi";

export const authValidator = {
  signIn: Joi.object({
    email: Joi.string().required().email().label("email"),
    password: Joi.string().required().min(8).label("password"),
  })
    .unknown(false)
    .messages({ "any.unknown": "{{#label}} is not allowed" }),

  signUp: Joi.object({
    name: Joi.string().required().label("name"),
    email: Joi.string().email().required().label("email"),
    password: Joi.string().min(8).required().label("password"),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .label("passwordConfirm")
      .messages({ "any.only": '"passwordConfirm" does not match "password"' }),
  })
    .unknown(false)
    .messages({ "any.unknown": "{{#label}} field is not allowed" }),

  resetPassword: Joi.object({
    password: Joi.string().required().label("password"),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .label("passwordConfirm")
      .messages({ "any.only": '"passwordConfirm" does not match "password"' }),
  })
    .unknown(false)
    .messages({ "any.unknown": "{{#label}} field is not allowed" }),
};
