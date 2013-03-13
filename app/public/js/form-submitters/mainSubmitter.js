$(document).ready(function(){
    $('form').submit(function(form) {
        var $form = $(form.target);
        var url = $form.attr('action');
        var updateElement = null;
        if ($form.attr('data-refresh-id')) {
            updateElement = $form.attr('data-refresh-id');
        }

        $form.children('button, submit').disable();

        var method = $form.attr('method').toLowerCase() == "post" ?
            $.post : $.get;

        method(url, $form.serialize(), function() {
            if (updateElement) {
                $('#' + updateElement).load(window.location + ' #' + updateElement);
            }
            
            $form.children('button, submit').enable();
            $form.children('input[type=text], textarea').val('');
        });
        return false;
    });
});