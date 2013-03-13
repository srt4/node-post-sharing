$(document).ready(function(){
    $('form').submit(function() {
        var $form = $(this);
        var url = $form.attr('action');
        var updateElement = null;
        if ($form.attr('data-refresh-id')) {
            updateElement = $form.attr('data-refresh-id');
        }

        $form.children('button, submit').disabled = true;

        var method = $form.attr('method').toLowerCase() == "post" ?
            $.post : $.get;

        method(url, $form.serialize(), function() {
            if (updateElement) {
                $('#' + updateElement).load(window.location + ' #' + updateElement);
            }

            $form.children('button, submit').disabled = false;
            $form.children('input[type=text], textarea').val('');
        });

        return false;
    });
});