function play_pause_gif(e) {
    var id = $(e).attr('id');
    console.log(e);
    var gif_src = '/gifs/' + $('#' + id + 'gif').val();
    var origin_src = '/uploads/' + $('#' + id + 'origin').val();
    if ($(e).attr('class') == 'paused') {
        $(e).removeClass('paused');
        $(e).addClass('playing');
        $(e).attr('src', gif_src);
    } else {
        $(e).removeClass('playing');
        $(e).addClass('paused');
        $(e).attr('src', origin_src);
    }
}