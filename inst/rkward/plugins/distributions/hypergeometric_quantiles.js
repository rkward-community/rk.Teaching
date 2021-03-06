// author: Alfredo Sánchez Alberca (asalber@ceu.es)

// author: Alfredo Sánchez Alberca (asalber@ceu.es)

var p,
  populationSize,
  successes,
  failures,
  sampleSize,
  tail;

function setGlobals() {
  p = getString("p");
  populationSize = getString("populationSize");
  successes = getString("successes");
  sampleSize = getString("sampleSize");
  failures = parseInt(populationSize) - parseInt(successes);
  tail = getString("tail");
}

function calculate() {
  setGlobals();
  echo('result <- (qhyper(p = c(' + p + '), m = ' + successes + ', n = ' + failures + ', k = ' + sampleSize + ', ' + tail + '))\n');
}

function printout() {
  // Header
  header = new Header(i18n("Hypergeometric quantiles H(%1,%2,%3)", populationSize, successes, sampleSize));
  header.add(i18n("Population size"), populationSize);
  header.add(i18n("Number of successes in population"), successes);
  header.add(i18n("Number of draws"), sampleSize);
  if (tail === "lower.tail=TRUE") {
    header.add(i18n("Accumulation tail"), i18n("Left (&le;)"));
  } else {
    header.add(i18n("Accumulation tail"), i18n("Right (>)"));
  }
  header.print();
  // Result
  echo('rk.results (list(' + i18n("Cumulative prob") + ' = c(' + p + '), ' + i18n("Quantile") + ' = result))\n');
}