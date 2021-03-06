regcomp <- function(y,x, models=c("linear", "quadratic", "cubic", "potential", "exponential", "logarithmic", "inverse", "sigmoid"), subset=NULL, decimals=4){
	if (length(models)==0){
		stop("You must select at least a model type")
	}
	names = c()
	r=NULL
	p=NULL
	if ("linear" %in% models){
		names <- c(names,"Linear")
		m <- lm(y~x,subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("quadratic" %in% models){
		names <- c(names,"Quadratic")
		m <- lm(y~x+I(x^2),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))	
	}
	if ("cubic" %in% models){
		names <- c(names,"Cubic")
		m <- lm(y~x+I(x^2)+I(x^3),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("potential" %in% models){
		names <- c(names,"Potential")
		m <- lm(log(y)~log(x),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("exponential" %in% models){
		names <- c(names,"Exponential")
		m <- lm(log(y)~x,subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("logarithmic" %in% models){
		names <- c(names,"Logarithmic")
		m <- lm(y~log(x),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("inverse" %in% models){
		names <- c(names,"Inverse")
		m <- lm(y~I(1/x),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	if ("sigmoid" %in% models){
		names <- c(names,"Sigmoidal")
		m <- lm(log(y)~I(1/x),subset=subset)
		r <- c(r,summary(m)$r.squared)
		p <- c(p,pf(q=c(summary(m)$fstatistic["value"]),df1=summary(m)$fstatistic["numdf"],df2=summary(m)$fstatistic["dendf"],lower.tail=FALSE))
	}
	t <- data.frame(names,round(r,decimals),format.pval(p))
	t <- t[order(-r),]
	colnames(t) <- c("Model","R<sup>2</sup>","p-value")
	rownames(t) <- rep(NULL,nrow(t))
	return(t)
}
