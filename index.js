module.exports = Morph;

function Morph (a, b, opts) {
    if (!(this instanceof Morph)) return new Morph(a, b);
    if (!opts) opts = {};
    
    var svg = this.element = opts.svg || createElement('svg');
    
    var pc = createElement('path');
    pc.setAttribute('style', [
        'fill:' + (opts.fill || 'none'),
        'stroke:' + (opts.stroke || 'black'),
        'stroke-width:' + (opts.strokeWidth || '1px')
    ].join(';'));
    pc.setAttribute('d', 'M ' + a.join(' L '));
    
    var auga = a;
    var augb = b;
    if (a.length < b.length) {
        auga = expand(a, b.length);
    }
    else if (b.length < a.length) {
        augb = expand(b, a.length);
    }
    
    var start = 'M ' + auga.join(' L ');
    var end = 'M ' + augb.join(' L ');
    
    var anim = createElement('animate');
    anim.setAttribute('dur', opts.duration || '1s');
    anim.setAttribute('repeatCount', opts.repeatCount || 'indefinite');
    anim.setAttribute('attributeName', 'd');
    anim.setAttribute('d', start);
    anim.setAttribute('values', start + ';' + end);
    
    pc.appendChild(anim);
    svg.appendChild(pc);
}

Morph.prototype.appendTo = function (target) {
    if (typeof target === 'string') {
        target = document.querySelector(target);
    }
    target.appendChild(this.element);
};

function createElement (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function mean (pts) {
    var sum = [ 0, 0 ];
    for (var i = 0; i < pts.length; i++) {
        sum[0] += pts[i][0];
        sum[1] += pts[i][1];
    }
    return [ sum[0] / sum.length, sum[1] / sum.length ];
}

function distances (pts) {
    var res = [];
    for (var i = 0; i < pts.length - 1; i++) {
        res.push({ index: i, distance: dist(pts[i], pts[i+1]) });
    }
    return res;
}

function dist (a, b) {
    var x = a[0] - b[0], y = a[1] - b[1];
    return Math.sqrt(x*x + y*y);
}


function expand (a, len) {
    var res = a.slice();
    var extra = [];
    var da = distances(a).sort(cmp);
    
    for (var i = 0; i < len - a.length; i++) {
        if (da.length === 0) {
            da = distances(res).sort(cmp);
        }
        var d = da.shift();
        res.splice(d.index, 0, mean([ res[d.index], res[d.index+1] ]));
        
        for (var j = d.index; j < da.length; j++) {
            da[j].index ++;
        }
    }
    var offset = 0;
    for (var i in extra) {
        res.splice(i + offset, 0, extra[i]);
        offset ++;
    }
    return res;
    
    function cmp (a, b) {
        return a.distance > b.distance ? -1 : 1;
    }
}
