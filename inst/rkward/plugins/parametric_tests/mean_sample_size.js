// author: Alfredo Sánchez Alberca (asalber@ceu.es)

// globals
var sd,
  confLevel,
  error;

function setGlobalVars() {
  sd = getString("sd");
  confLevel = getString("confLevel");
  error = getString("error");
}

function preprocess() {
  setGlobalVars();
  echo('library(rkTeaching)\n');
}

function calculate() {
  echo('result <- sampleSizeOneMean(mean=, sd=' + sd + ', sig.level= 1-' + confLevel + ', error=' + error + ', error.type="absolute")\n');
}

function printout() {
  // Header
  header = new Header(i18n("Sample size computation to estimate one mean"));
  header.add(i18n("Standard deviation of the population"), sd);
  header.add(i18n("Confidence level"), confLevel);
  header.add(i18n("Error"), '&#177;' + error);
  header.print();
  // Sample size result
  echo('rk.results (list(' + i18n("Sample size required") + ' = result$n))\n');
}
