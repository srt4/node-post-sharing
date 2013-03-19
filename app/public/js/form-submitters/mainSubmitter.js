$(document).ready(function(){
    $('form').live('submit', function() {
        var $form = $(this);
        var url = $form.attr('action');
        var updateElement = null;
        if ($form.attr('data-refresh-id')) {
            updateElement = $form.attr('data-refresh-id');
        }

        $form.find('button, submit').attr('disabled', true);

        var method = $form.attr('method').toLowerCase() == "post" ?
            $.post : $.get;

        method(url, $form.serialize(), function() {
            if (updateElement) {
                $('#' + updateElement).load(window.location + ' #' + updateElement);
            }

            $form.find('button, submit').attr('disabled', false);
            $form.find('input[type=text], textarea').val('');
        });

        return false;
    });
});