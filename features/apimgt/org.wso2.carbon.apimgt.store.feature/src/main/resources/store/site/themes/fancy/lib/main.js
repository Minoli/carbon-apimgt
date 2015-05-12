$(document).ready(function(){

    $('[rel="popover"]').popover({
        container: 'body',
        html: true,
        trigger:'focus',
        content: function () {
            var clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
            return clone;
        }
    }).click(function(e) {
        e.preventDefault();
    });

	
});