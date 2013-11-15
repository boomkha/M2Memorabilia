function play_pause_gif(ele) {
    var e = $(ele).children('img');
    var s = $(ele).children('span');
    var id = $(e).attr('id');
    console.log(e);
    var gif_src = '/gifs/' + $('#' + id + 'gif').val();
    var origin_src = '/uploads/' + $('#' + id + 'origin').val();

    if ($(e).hasClass('paused')) {
        $(e).removeClass('paused');
        $(e).addClass('playing');
        $(e).attr('src', gif_src);
        $(s).hide();
    } else {
        $(e).removeClass('playing');
        $(e).addClass('paused');
        $(e).attr('src', origin_src);
        $(s).show();
    }
}