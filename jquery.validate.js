/**
 * @author GeekTantra
 * @date 20 September 2009
 * http://www.geektantra.com/2009/09/jquery-live-form-validation/
 * Modified by ddarren: added support for twitter boostrap
 * https://github.com/ddarren/jQuery-Live-Form-Validation-For-Twitter-Bootstrap
 */
(function(jQuery){
    var ValidationErrors = new Array();
    jQuery.fn.validate = function(options){
        options = jQuery.extend({
            expression: "return true;",
            message: "",
            error_message_class: "help-inline",
            error_container_class: "control-group",
            live: true
        }, options);
        var SelfID = jQuery(this).attr("id");
        
        // getting unix_time to make a unique id for form if the form doesn't already have an one
        var unix_time = new Date();
        unix_time = parseInt(unix_time.getTime() / 1000);
        //give the form an id if it doesn't already have one
        if (!jQuery(this).parents('form:first').attr("id")) {
            jQuery(this).parents('form:first').attr("id", "Form_" + unix_time);
        }
        var FormID = jQuery(this).parents('form:first').attr("id");
        if (!((typeof(ValidationErrors[FormID]) == 'object') && (ValidationErrors[FormID] instanceof Array))) {
            ValidationErrors[FormID] = new Array();
        }
        if (options['live']) {
            // if the passed in element is a container with inputs
            if (jQuery(this).find('input').length > 0) {
                // once an input loses focus, run validation
                jQuery(this).find('input').bind('blur', function(){
                    if (validate_field("#" + SelfID, options)) {
                        if (options.callback_success) 
                            options.callback_success(this);
                    }
                    else {
                        if (options.callback_failure) 
                            options.callback_failure(this);
                    }
                });
                // remove error message once an input is focused on 
                jQuery(this).find('input').bind('focus keypress click', function(){
                    jQuery("#" + SelfID).next('.' + options['error_message_class']).remove();
                    jQuery("#" + SelfID).parents("." + options['error_container_class']).removeClass('error');
                });
            }
            // if the passed in element is input to validate itselft
            else {
                // when  the input loses focus, validate
                jQuery(this).bind('blur', function(){
                    validate_field(this);
                });
                // when the input gains focused remove error message
                jQuery(this).bind('focus keypress', function(){
                    var jQueryObjectBeforeErrorMessage = getjQueryObjectBeforeErrorMessage(jQuery(this)); 
                    jQueryObjectBeforeErrorMessage.next('.' + options['error_message_class']).fadeOut("fast", function(){
                        jQuery(this).remove();
                    });
    				jQuery(this).parents("." + options['error_container_class']).removeClass('error');
                });
            }
        }
        // perform validation when form is submitted - needed by both live and non-live validation
        jQuery(this).parents("form").submit(function(){

            if (validate_field('#' + SelfID)) {			
                return true;
                }
            else 
                return false;
        });
        
        // function that does the actual validation
        function validate_field(id){
            var self = jQuery(id).attr("id");
            var expression = 'function Validate(){' + options['expression'].replace(/VAL/g, 'jQuery(\'#' + self + '\').val()') + '} Validate()';
            var validation_state = eval(expression);
            if (!validation_state) {
                jQueryObjectBeforeErrorMessage = getjQueryObjectBeforeErrorMessage(jQuery(id));
                
                if (jQueryObjectBeforeErrorMessage.next('.' + options['error_message_class']).length == 0) {

                    jQueryObjectBeforeErrorMessage.after('<span class="' + options['error_message_class'] + '">' + options['message'] + '</span>');
					          jQuery(id).parents("div." + options['error_container_class']).addClass("error");
                }


                if (ValidationErrors[FormID].join("|").search(id) == -1) 
                    ValidationErrors[FormID].push(id);
                return false;
            }
            else {
                for (var i = 0; i < ValidationErrors[FormID].length; i++) {
                    if (ValidationErrors[FormID][i] == id) 
                        ValidationErrors[FormID].splice(i, 1);
                }
                return true;
            }
        }
        
        function getjQueryObjectBeforeErrorMessage(inputjQueryObject)
        {
             // check see if the twitter bootstrap appended text span tag is used
            if(inputjQueryObject.next().hasClass("add-on"))
            {
              return inputjQueryObject.next();
            }
            
            return inputjQueryObject;
        }
    };
    //  Callback that is called if validation is successful
    jQuery.fn.validated = function(callback){
        jQuery(this).each(function(){
            if (this.tagName == "FORM") {
                jQuery(this).submit(function(){
                    if (ValidationErrors[jQuery(this).attr("id")].length == 0) 
                        callback();
					return false;
                });
            }
        });
    };
})(jQuery);
