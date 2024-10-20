//author: Alfredo Sánchez Alberca (asalber@ceu.es)

include("../common/common_functions.js")
include("../common/filter.js")

var dataframe,
    variable,
    variableName,
    grouped,
    groups,
    groupsName,
    y,
    xlab,
    ylab,
    fill,
    position,
	pos,
    barColor,
    borderColor,
    facet,
    relative,
    cumulative,
    breaks;

function setGlobalVars() {
    variable = getString("variable");
    dataframe = getDataframe(variable);
    variableName = getString("variable.shortname");
    grouped = getBoolean("grouped");
    groups = getList("groups");
    groupsName = getList("groups.shortname");
    relative = getBoolean("relative");
    cumulative = getBoolean("cumulative");
    position = getString("position");
    polygon = getBoolean("polygon");
}

function preprocess() {
    setGlobalVars();
    echo('library(tidyverse)\n');
}

function calculate() {
    // Filter
    filter();
    // Set axes labels
    xlab = ' +\n\txlab(' + quote(variableName) + ')';
    ylab = ' +\n\tylab(' + i18n("Absolute frequency") + ')';
    fill = '';
    // Set bar color
    barColor = getString("barFillColor.code.printout")
    if (barColor != '') {
        barColor = ', fill = I(' + barColor + ')';
    } else {
        barColor = ', fill = I("#FF9999")';
    }
    // Set border color
    borderColor = getString("barBorderColor.code.printout");
    if (borderColor != '') {
        borderColor = ', colour = I(' + borderColor + ')';
    } else {
        borderColor = ', colour = I("white")';
    }
    // Set grouped mode
    pos = '';
    facet = '';
    if (grouped) {
        if (groupsName.length == 1) {
            fill = ', fill = ' + groupsName;
        } else {
            fill = ', fill = interaction(' + groupsName.join(', ') + ')';
        }
        if (cumulative || position === 'faceted') {
            if (groupsName.length == 1) {
                facet = ' +\n\tfacet_grid(' + groupsName + ' ~ .)';
            } else {
                facet = ' +\n\tfacet_grid(interaction(' + groupsName.join(', ') + ') ~ .)';
            }
        } else {
            pos = ', position = ' + quote(position);
            if (position === 'identity') {
                pos += ', alpha=.5';
            }
        }
        barColor = '';
    }
    // Interval breaks
    echo('breaks <- ' + getString("cells.code.preprocess") + '\n');
    // Set frecuency type
    y = '';
    if (relative) {
        y = 'aes(y = after_stat(count/sum(count))), ';
        ylab = ' +\n\tylab(' + i18n("Relative frequency") + ')';
    }
    if (cumulative) {
        y = 'aes(y = after_stat(cumsum(count))), ';
        ylab = ' +\n\tylab(' + i18n("Cumulative frequency") + ')';
        if (relative) {
            y = 'aes(y = after_stat(cumsum(count)/sum(count))), ';
            ylab = ' +\n\tylab(' + i18n("Cumulative relative frequency") + ')';
        }
    }
     // Plot
     echo('plot <- ' + dataframe + ' |>\n');
     echo('\tggplot(aes(x = ' + variableName + fill + ')) +\n');
     echo('\tgeom_histogram(' + y + 'breaks = breaks' + barColor + borderColor + pos + ')' + xlab + ylab + facet + getString("plotOptions.code.calculate") + '\n');
    //  echo('p <- ggplot(data=.df, aes(x=Center, y=' + y + fill + ')) + geom_bar(width=diff(.breaks), stat="identity", orientation="x"' + barColor + borderColor + pos + ')' + ' + scale_x_continuous(breaks=.breaks)' + xlab + ylab + facet + getString("plotOptions.code.calculate") + '\n');

  
}

function printout() {
    doPrintout(true);
}

function preview() {
    preprocess();
    calculate();
    doPrintout(false);
}

function doPrintout(full) {
	// Header
	if (full) {
        header = new Header(i18n("Histogram of %1", variableName));
        header.add(i18n("Data frame"), dataframe);
        header.add(i18n("Variable"), variableName);
        if (grouped) {
            header.add(i18n("Grouping variable(s)"), groupsName.join(", "));
        }
				header.add(i18n("Class intervals method"), getString("cells.code.printout"));
        if (filtered) {
            header.addFromUI("condition");
        }
        header.print();

        echo('rk.graph.on()\n');
    }
    // Plot
    echo('try ({\n');
    echo('\tprint(plot)\n');
    echo('})\n');
    if (full) {
        echo('rk.graph.off ()\n');
    }
}
