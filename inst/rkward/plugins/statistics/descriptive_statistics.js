// author: Alfredo Sánchez Alberca (asalber@ceu.es)

include("../common/common_functions.js")
include("../common/filter.js")

var dataframe,
	variables,
	variablesName,
	grouped,
	groups,
	groupsName,
	statistics,
	narm;

function setGlobalVars() {
	variables = getList("variables");
	dataframe = getDataframe(variables);
	variablesName = getList("variables.shortname");
	grouped = getBoolean("grouped");
	groups = getList("groups");
	groupsName = getList("groups.shortname");
}

function preprocess() {
	setGlobalVars();
	echo('library(rkTeaching)\n');
	echo('library(tidyverse)\n');
	echo('library(knitr)\n');
	echo('library(kableExtra)\n');
}

function calculate() {
	// Filter
	filter();
	// Remove NA
	var narm = "na.rm=FALSE";
	if (getBoolean("narm")) narm = "na.rm = TRUE";
	// Statistics
	statistics = '';
	//statistics = getString("min") + getString("max") + getString("mean") + getString("median") + getString("mode") + getString("variance") + getString("unvariance") + getString("stdev") + getString("sd") + getString("cv") + getString("range") + getString("iqrange") + getString("skewness") + getString("kurtosis");
	if (getBoolean("min"))
		statistics += "\t\tmin = min(value, " + narm + "),\n";
	if (getBoolean("max"))
		statistics += "\t\tmax = max(value, " + narm + "),\n";
	if (getBoolean("mean"))
		statistics += "\t\tmean = mean(value, " + narm + "),\n";
	if (getBoolean("median"))
		statistics += "\t\tmedian = median(value, " + narm + "),\n ";
	if (getBoolean("mode"))
		statistics += "\t\tmode = Mode(value),\n";
	if (getBoolean("variance"))
		statistics += "\t\tvariance = variance(value, " + narm + "),\n";
	if (getBoolean("unvariance"))
		statistics += "\t\tcorrected_variance = var(value, " + narm + "),\n";
	if (getBoolean("stdev"))
		statistics += "\t\tstdev = stdev(value, " + narm + "),\n";
	if (getBoolean("sd"))
		statistics += "\t\tcorrected_stdev = sd(value, " + narm + "),\n";
	if (getBoolean("cv"))
		statistics += "\t\tcv = sd(value, " + narm + ") / mean(value, " + narm + "),\n";
	if (getBoolean("range"))
		statistics += "\t\trange = max(value, " + narm + ") - min(value, " + narm + "),\n";
	if (getBoolean("iqrange"))
		statistics += "\t\tiqrange = IQR(value, " + narm + "),\n";
	if (getBoolean("skewness"))
		statistics += "\t\tskewness = skewness(value, " + narm + "),\n";
	if (getBoolean("kurtosis"))
		statistics += "\t\tkurtosis = kurtosis(value, " + narm + "),\n";
	if (getBoolean("quartiles"))
		quartiles = 'c(0.25, 0.5, 0.75)';
	// Quantiles
	var quantiles = '';
	if (getBoolean("quartiles")) {
		quantiles += '0.25, 0.5, 0.75 ';
		if (getString("quantiles") != '')
			quantiles += ', ';
		quantiles += getString("quantiles");
	}
	if (quantiles != '')
		statistics += "\t\tquantiles = list(quantile(value, c(" + quantiles + "), " + narm + ")), ";
	statistics = statistics.slice(0, -2);

	echo('result <- ' + dataframe + ' |>\n');
	echo('\tpivot_longer(cols = c(' + variablesName + '), names_to = "variable", values_to = "value") |>\n');
	// Grouped mode
    if (grouped) {
        echo('\tgroup_by(' + groupsName + ', variable) |>\n');
    } else {
		echo('\tgroup_by(variable) |>\n');
	}
	echo('\tsummarise(\n' + statistics + '\n\t)');
	if (quantiles != '')
		echo(' |>\n\tunnest_wider(quantiles)');
	echo('\n');
	if (grouped) {
        echo('result <- split(result, list(result$' + groupsName.join(",result$") + '), drop = TRUE)\n');
    }
}

function printout() {
	header = new Header(i18n("Descriptive statistics of %1", variablesName.join(', ')));
	header.add(i18n("Data frame"), dataframe);
	header.add(i18n("Variable(s)"), variablesName.join(', '));
	if (grouped) {
		header.add(i18n("Grouping variable(s)"), groupsName.join(", "));
	}
	if (getBoolean("narm")) {
		header.add(i18n("Ommit missing values"), i18n("Yes"));
	} else {
		header.add(i18n("Ommit missing values"), i18n("No"));
	}
	if (filtered) {
		header.addFromUI("condition");
	}
	header.print();
	// Print result
    if (grouped) {
        echo('for (i in 1:length(result)){\n');
        echo('\trk.header(paste(' + i18n("Group") + ', "' + groupsName.join('.') + ' = ", names(result)[i]),level=3)\n');
        echo('\t rk.print.literal(result[[i]] |>\n');
		echo('\tkable("html", align = "c", escape = F) |>\n');
		echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE))\n');
        echo('}\n');
    } else {
        echo('rk.print.literal(result |>\n');
    	echo('\tkable("html", align = "c", escape = F) |>\n');
    	echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
    	echo(')\n'); 
    }
}
