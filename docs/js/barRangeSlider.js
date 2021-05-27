function barRangeSlider(initialDataArray, w, h, parentSelector, onChangeHandler) {
    const chartWidth = w - 20;
    let chartHeight = h - 20;
    let startSelection = 2010;
    let padding = 20;

    const dataFinal = initialDataArray;
    let params = {};
    params.minY = params.yScale ? 0.0001 : 0;
    params.yScale = params.yScale || d3.scaleLinear();
    chartHeight = params.height || chartHeight;
    params.yTicks = params.yTicks || 4;
    params.freezeMin = params.freezeMin || false;

    d3.selection.prototype.patternify = function (params) {
        var container = this;
        var selector = params.selector;
        var elementTag = params.tag;
        var data = params.data || [selector];

        // Pattern in action
        var selection = container.selectAll('.' + selector).data(data, (d, i) => {
            if (typeof d === "object") {
                if (d.id) {
                    return d.id;
                }
            }
            return i;
        })
        selection.exit().remove();
        selection = selection.enter().append(elementTag).merge(selection)
        selection.attr('class', selector);
        return selection;
    }

    const handlerWidth = 2,
        handlerFill = '#E1E1E3',
        middleHandlerWidth = 10,
        middleHandlerStroke = '#8E8E8E',
        middleHandlerFill = '#EFF4F7';

    const svg = d3.select(parentSelector)
        .append('svg')
        .attr('viewBox', [-10, -10, chartWidth + 10 + padding, chartHeight + 10 + padding])
        .style('overflow', 'visible');

    const chart = svg.append('g');

    const values = dataFinal.map(d => d.value);
    const min = d3.min(values);
    const max = d3.max(values);
    const maxX = dataFinal[dataFinal.length - 1].key
    const minX = dataFinal[0].key;

    let eachBarWidth = (chartWidth - padding * 3) / (maxX - minX);

    const scale = params.yScale.domain([params.minY, max]).range([0, chartHeight])
    const scaleY = scale.copy().domain([max, params.minY]).range([0, chartHeight])

    const scaleX = d3.scaleLinear().domain([minX, maxX]).range([eachBarWidth / 2, chartWidth - eachBarWidth / 2])
    var axis = d3.axisBottom(scaleX).ticks(values.length).tickFormat(d3.format("d"));
    const axisY = d3.axisLeft(scaleY).tickSize(-chartWidth).ticks(10).tickFormat(d3.format("d"));

    const bars = chart.selectAll('.bar')
        .data(dataFinal)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', eachBarWidth)
        .attr('height', d => scale(d.value))
        .attr('fill', '#999')
        .attr('y', d => -scale(d.value) + (chartHeight))
        .attr('x', (d, i) => scaleX(d.key) - eachBarWidth / 2)
        .attr('opacity', 0.9);

    const xAxisWrapper = chart.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(axis);

    const yAxisWrapper = chart.append('g')
        .attr('transform', `translate(0, 0)`)
        .call(axisY);

    const brush = chart.append("g")
        .attr("class", "brush")
        .call(d3.brushX()
            .extent([
                [0, 0],
                [chartWidth, chartHeight]
            ])
            .on("start", brushStarted)
            .on("end", brushEnded)
            .on("brush", brushed));

    chart.selectAll('.selection').attr('fill-opacity', 0.1);

    var handle = brush.patternify({
        tag: 'g',
        selector: 'custom-handle',
        data: [{left: true}, {left: false}]
    })
        .attr("cursor", "ew-resize")
        .attr('pointer-events', 'all');

    handle.patternify({
        tag: 'rect',
        selector: 'custom-handle-rect',
        data: d => [d]
    })
        .attr('width', handlerWidth)
        .attr('height', 100)
        .attr('fill', handlerFill)
        .attr('stroke', handlerFill)
        .attr('y', -50)
        .attr('pointer-events', 'none');

    handle.patternify({
        tag: 'rect',
        selector: 'custom-handle-rect-middle',
        data: d => [d]
    })
        .attr('width', middleHandlerWidth)
        .attr('height', 30)
        .attr('fill', middleHandlerFill)
        .attr('stroke', middleHandlerStroke)
        .attr('y', -16)
        .attr('x', -middleHandlerWidth / 4)
        .attr('pointer-events', 'none')
        .attr('rx', 3);

    handle.patternify({
        tag: 'rect',
        selector: 'custom-handle-rect-line-left',
        data: d => [d]
    })
        .attr('width', 0.7)
        .attr('height', 20)
        .attr('fill', middleHandlerStroke)
        .attr('stroke', middleHandlerStroke)
        .attr('y', -100 / 6 + 5)
        .attr('x', -middleHandlerWidth / 4 + 3)
        .attr('pointer-events', 'none');

    handle.patternify({
        tag: 'rect',
        selector: 'custom-handle-rect-line-right',
        data: d => [d]
    })
        .attr('width', 0.7)
        .attr('height', 20)
        .attr('fill', middleHandlerStroke)
        .attr('stroke', middleHandlerStroke)
        .attr('y', -100 / 6 + 5)
        .attr('x', -middleHandlerWidth / 4 + middleHandlerWidth - 3)
        .attr('pointer-events', 'none');

    handle.attr("display", 'none');

    function brushStarted(event) {
        if (event.selection) {
            startSelection = event.selection[0];
        }
    }

    function brushEnded(event) {
        if (!event.selection) {
            handle.attr("display", 'none');
            output({
                range: [minX, maxX]
            });
            return;
        }
        if (event.sourceEvent.type === "brush") return;

        var d0 = event.selection.map(scaleX.invert),
            d1 = d0.map(d3.timeDay.round);

        if (d1[0] >= d1[1]) {
            d1[0] = d3.timeDay.floor(d0[0]);
            d1[1] = d3.timeDay.offset(d1[0]);
        }
    }

    function brushed(event) {
        if (event.sourceEvent.type === "brush") return;
        if (params.freezeMin) {
            if (event.selection[0] < startSelection) {
                event.selection[1] = Math.min(event.selection[0], event.selection[1])
            }
            if (event.selection[0] >= startSelection) {
                event.selection[1] = Math.max(event.selection[0], event.selection[1])
            }
            event.selection[0] = 0;
            d3.select(this)
              .call(event.target.move, event.selection);
        }

        var d0 = event.selection.map(scaleX.invert);
        const s = event.selection;

        handle.attr("display", null)
            .attr("transform", function (d, i) {
                return "translate(" + (s[i] - 2) + "," + chartHeight / 2 + ")";
            });
        output({range: d0});
    }

    yAxisWrapper.selectAll('.domain').remove();
    xAxisWrapper.selectAll('.domain').attr('opacity', 0.1)

    chart.selectAll('.tick line').attr('opacity', 0.1)

    function output(value) {
        const node = svg.node();
        node.value = value;
        node.value.data = getData(node.value.range);
        node.dispatchEvent(new CustomEvent('input'))
        onChangeHandler(...value.range);
    }

    function getData(range) {
        const dataBars = bars
            .attr('fill', '#999')
            .filter(d => {
                return d.key >= range[0] && d.key <= range[1];
            })
            .attr('fill', '#36C48B')
            .nodes()
            .map(d => d.__data__)
            .map(d => d.values)
            .reduce((a, b) => a.concat(b), [])
        return dataBars;
    }

    const returnValue = Object.assign(svg.node(), {
        value: {
            range: [minX, maxX],
            data: initialData
        }
    })
    return returnValue;
}
