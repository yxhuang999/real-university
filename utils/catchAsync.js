// an async utility function that handles error and pass it to next, avoiding to use try/catch around every async functions


module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}