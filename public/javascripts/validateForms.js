(() => {
    'use strict'


    // How the validation works: add code below to the template -> give the form a class of 'needs-validation' ->
    // set the form to novalidate to turn off default HTML validations -> set required to all inputs that need to be validated

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()