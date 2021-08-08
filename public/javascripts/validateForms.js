
    (function () {
        'use strict'
      
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        const forms = document.querySelectorAll('.validated')           //select all forms with the class "validated" which is added above
      
        // Loop over them and prevent submission
        Array.from(forms)                                               //this Array.from is used to make an array (From "form")
          .forEach(function (form) {                                    //loop over it with forEach
            form.addEventListener('submit', function (event) {          //add an event listener to each form
              if (!form.checkValidity()) {                              //check each's validity when the form is submitted and if it's not valid, then prevent default and stop propagating
                event.preventDefault()
                event.stopPropagation()
              }
      
              form.classList.add('was-validated')
            }, false)
          })
      })()
     