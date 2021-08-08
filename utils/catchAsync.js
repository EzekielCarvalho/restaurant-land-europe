//This exports a new function created to accept a new function which returns a new function which has func executed and catches any errors and passed the errors to next. 
//This is going to be used to wrap our asynchronous functions

module.exports = (func) => {                //this accepts the asynchronous function named here as "func". So it was basically accept all asychronous functions
    return (req, res, next) => {            //returns a new function that has func excecuted and it catches any errors and passed the error to next 
        func(req, res, next).catch(next);
    }
}