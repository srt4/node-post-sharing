
$(document).ready(function(){

	var hc = new HomeController();
	var av = new AccountValidator();

    var $accountForm = $("#account-form");

	$accountForm.ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (av.validateForm() == false){
				return false;
			} 	else{
			// push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') hc.onUpdateSuccess();
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
			    av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();
	$('#github-banner').css('top', '41px');

// customize the account settings form //
	
	$accountForm.find('h1').text('Account Settings');
	$accountForm.find('#sub1').text('Here are the current settings for your account.');
	$('#user-tf').attr('disabled', 'disabled');
	$accountForm.find('#account-form-btn1').html('Delete');
	$accountForm.find('#account-form-btn1').addClass('btn-danger');
	$accountForm.find('#account-form-btn2').html('Update');

// setup the confirm window that displays when the user chooses to delete their account //

    var $modalConfirm = $('.modal-confirm');
	$modalConfirm.modal({ show : false, keyboard : true, backdrop : true });
	$modalConfirm.find('.modal-header h3').text('Delete Account');
	$modalConfirm.find('.modal-body p').html('Are you sure you want to delete your account?');
	$modalConfirm.find('.cancel').html('Cancel');
	$modalConfirm.find('.submit').html('Delete');
	$modalConfirm.find('.submit').addClass('btn-danger');

})