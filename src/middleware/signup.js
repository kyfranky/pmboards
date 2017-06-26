module.exports = function (app) {

  return function (req, res, next) {

    const body = req.body;

    app.service('users').create({
      firstName: body.fname,
      lastName: body.lname,
      phoneNumber: body.pnumber,
      email: body.email,
      password: body.pswrd
    })
      .then(
        res.redirect('/login.html'))
      // On errors, just call our error middleware
      .catch(next);

  };

};
