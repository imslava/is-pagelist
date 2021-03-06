'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var fs = require('fs');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(file,opt) {
    if (!file) {
        throw new PluginError('is-pagelist', 'Missing file option for is-pagelist');
    }

    opt = opt || {};

    if (typeof opt.newLine !== 'string'){
        opt.newLine = gutil.linefeed;
    }

    var fileName;
    var latestFile;
    var latestMod;
    var contents = '';
    var linkName = '';
    var head;
    var footer;

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof  file.path === 'string') {
        fileName = path.basename(file.path);
    } else {
        throw new PluginError('is-pagelist', 'Missing path in file options for is-pagelist');
    }

    function bufferContents(file, enc, cb){

        if (file.isNull()) {
            cb();
            return;
        }

        if (file.isStream()) {
            this.emit('error',new PluginError('is-pagelist','Streaming not supported'));
            cb();
            return;
        }

        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }

        linkName = (/<title>(.*)<\/title>/i.exec(file.contents.toString()));
        linkName = linkName === null ? '' : linkName[1];

        contents += '<li><a href="' + file.relative + '">'+ linkName + '</a></li>';

        cb();
    }

    function endStream(cb) {

        if (!latestFile) {
            cb();
            return;
        }

        var joinedFile;

        if (typeof file === 'string') {
            joinedFile = latestFile.clone({contents: false});
            joinedFile.path = path.join(latestFile.base, file);
        } else {
            joinedFile = new File(file);
        }

        head = fs.readFileSync(process.cwd()+'/node_modules/is-pagelist/head.html');

        footer = fs.readFileSync(process.cwd()+'/node_modules/is-pagelist/footer.html');

        contents = head.toString() + contents + footer.toString();

        joinedFile.contents = new Buffer(contents);

        this.push(joinedFile);

        cb();
    }

    return through.obj(bufferContents,endStream);
}
