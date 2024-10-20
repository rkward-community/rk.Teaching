// author: Alfredo Sánchez Alberca (asalber@ceu.es)

include("../common/common_functions.js")
include("../common/filter.js")

// globals
var row,
	rowName,
	col,
	colName,
	dataframe,
	fisher,
	observed,
	percentagesObserved,
	expected,
	percentagesExpected;

function setGlobalVars() {
	row = getString("row");
	rowName = getString("row.shortname");
	dataframe = getDataframe(row);
	col = getString("col");
	colName = getString("col.shortname");
	fisher = getBoolean("fisher");
	observed = getBoolean("observed");
	percentagesObserved = getBoolean("percentagesObserved");
	expected = getBoolean("expected");
	percentagesExpected = getBoolean("percentagesExpected");
	groupsName = getList("groups.shortname");
	grouped = getBoolean("grouped");
	groups = getList("groups");
}

function preprocess() {
	setGlobalVars();
	echo('library(tidyverse)\n');
	echo('library(broom)\n');
	echo('library(knitr)\n');
	echo('library(kableExtra)\n');
}

function calculate() {
	// Filter
	filter();
	// Grouped mode
	if (grouped) {
		echo('result <- ' + dataframe + ' |>\n');
		echo('\tgroup_by(' + groupsName + ') |>\n');
		echo('\tsummarise(test = list(chisq.test(' + rowName + ' , ' + colName + ')), ');
		echo('tidytest = tidy(test[[1]])) |>\n');
		echo('\tunnest(tidytest)\n');
		echo('result <- split(result, list(result$' + groupsName.join(",result$") + '), drop = TRUE)\n');
		if (fisher) {
			echo('result.fisher <- ' + dataframe + ' |>\n');
			echo('\tgroup_by(' + groupsName + ') |>\n');
			echo('\tsummarise(test = tidy(fisher.test(' + rowName + ' , ' + colName + '))) |>\n');
			echo('\tunnest(test)\n');
			echo('result.fisher <- split(result.fisher, list(result.fisher$' + groupsName.join(",result.fisher$") + '), drop = TRUE)\n');
		}
	} else {
		// Non-grouped mode
		echo('test <- chisq.test(' + row + ', ' + col + ')\n');
		echo('result <- tidy(test)\n');
		if (fisher) {
			echo('result.fisher <- tidy(fisher.test(' + row + ', ' + col + '))\n');
		}
	}
}

function printout() {
	// Header
	header = new Header(i18n("Chi-square test of independence of %1 and %2", rowName, colName));
	header.add(i18n("Data frame"), dataframe);
	header.add(i18n("Variables"), rowName + ", " + colName);
	header.add(i18n("Null hypothesis"), i18n("There is no significant association between the variables."));
	header.add(i18n("Alternative hypothesis"), i18n("There is a significant association between the variables."));
	if (grouped) {
		header.add(i18n("Grouping variable(s)"), groupsName.join(", "));
	}
	if (filtered) {
		header.addFromUI("condition");
	}
	header.print();

	// Grouped mode
	if (grouped) {
		echo('for (i in 1:length(result)){\n');
		echo('\trk.header(paste(' + i18n("Group %1 =", groupsName.join('.')) + ', names(result)[i]), level=3)\n');
		echo('\trk.print.literal(tibble(');
		echo(i18n("Chi statistic") + ' = result[[i]]$statistic, ');
		echo(i18n("DF") + ' = result[[i]]$parameter, ');
		echo(i18n("p-value") + ' = result[[i]]$p.value) |>\n');
		echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
		echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
		echo('\t)\n'); 
		if (fisher) {
			echo('\trk.header(' + i18n("Fisher exact test") + ', level=3)\n');
			echo('\trk.print.literal(tibble(');
			echo(i18n("p-value") + ' = result.fisher[[i]]$p.value)|>\n');
			echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
			echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
			echo('\t)\n'); 
		}
		if (observed) {
			echo('\trk.header(' + i18n("Observed frequencies") + ', level=3)\n');
			echo('\trk.print.literal(result[[i]]$test[[1]]$observed |>\n');
			echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
			echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
			echo('\t)\n'); 
		}
		if (expected) {
			echo('\trk.header(' + i18n("Expected frequencies") + ', level=3)\n');
			echo('\trk.print.literal(result[[i]]$test[[1]]$expected |>\n');
			echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
			echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
			echo('\t)\n'); 
		}
		if (percentagesObserved) {
			echo('\trk.header(' + i18n("Observed percentages") + ', level=3)\n');
			echo('\trk.print.literal((prop.table(result[[i]]$test[[1]]$observed) * 100) |>\n');
			echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
			echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
			echo('\t)\n'); 
		}
		if (percentagesExpected) {
			echo('\trk.header(' + i18n("Expected percentages") + ', level=3)\n');
			echo('\trk.print.literal((prop.table(result[[i]]$test[[1]]$expected) * 100) |>\n');
			echo('\t\tkable("html", align = "c", escape = FALSE) |>\n');
			echo('\t\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
			echo('\t)\n'); 
		}
		echo('}\n');
	} else {
		// Non-grouped mode
		echo('rk.print.literal(tibble(');
		echo(i18n("Chi statistic") + ' = result$statistic, ');
		echo(i18n("DF") + ' = result$parameter, ');
		echo(i18n("p-value") + ' = result$p.value) |>\n');
		echo('\tkable("html", align = "c", escape = F) |>\n');
    	echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');
		echo(')\n');
		if (fisher) {
			echo('rk.header(' + i18n("Fisher exact test") + ', level=3)\n');
			echo('rk.print.literal(tibble(');
			echo(i18n("p-value") + ' = result.fisher$p.value) |>\n');
			echo('\tkable("html", align = "c", escape = F) |>\n');
			echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');	
			echo(')\n');
		}
		if (observed) {
			echo('rk.header(' + i18n("Observed frequencies") + ', level=3)\n');
			echo('rk.print.literal(test$observed |>\n');
			echo('\tkable("html", align = "c", escape = F) |>\n');
			echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');	
			echo(')\n');
		}
		if (expected) {
			echo('rk.header(' + i18n("Expected frequencies") + ', level=3)\n');
			echo('rk.print.literal(test$expected |>\n');
			echo('\tkable("html", align = "c", escape = F) |>\n');
			echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');	
			echo(')\n');
		}
		if (percentagesObserved) {
			echo('rk.header(' + i18n("Observed percentages") + ', level=3)\n');
			echo('rk.print.literal((prop.table(test$observed) * 100) |>\n');
			echo('\tkable("html", align = "c", escape = F) |>\n');
			echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');	
			echo(')\n');
		}
		if (percentagesExpected) {
			echo('rk.header(' + i18n("Expected percentages") + ', level=3)\n');
			echo('rk.print.literal((prop.table(test$expected) * 100) |>\n');
			echo('\tkable("html", align = "c", escape = F) |>\n');
			echo('\tkable_styling(bootstrap_options = c("striped", "hover"), full_width = FALSE)\n');	
			echo(')\n');
		}
	}
}