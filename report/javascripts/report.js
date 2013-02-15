/**
 * report.js
 */
$(function() {

    var toggleCollapsed = function($el) {
        if($el.hasClass('collapsed')) {
            $el.removeClass('collapsed');
        } else {
            $el.addClass('collapsed');
        }
    };

    $('.test-suite .title').on('click', function() {
        var $tests = $(this).siblings('.tests');
        toggleCollapsed($tests);
    });

    $('.test .message').on('click', function() {
        var $details = $(this).siblings('.details');
        toggleCollapsed($details);
    });

    $('.test .button.do-diff').on('click', function() {
        var $details = $(this).closest('.details'),
            $baseline = $details.find('.baseline img'),
            $current = $details.find('.current img');

        var onImagesLoaded = function(callback) {
            var loading = function() {
                if($baseline[0].complete && $current[0].complete) {
                    callback && callback($baseline[0], $current[0]);
                } else {
                    setTimeout(loading, 10);
                }
            };
            loading();
        };

        onImagesLoaded(function(baseline, current) {
            var diff = imagediff.diff(baseline, current),
                canvas = imagediff.createCanvas(diff.width, diff.height),
                context = canvas.getContext('2d');

            context.putImageData(diff, 0, 0);
            var $diff = $details.find('.diff');
            $diff.append(canvas);
            $diff.show();
        });
    });
});