# Suicide rate analysis over countries, years and generations

<div align="center">
Mental heath: "a state of well-being in which the individual realizes his or her own abilities, can cope with the normal stresses of life, can work productively and fruitfully, and is able to make a contribution to his or her community" - Wikipedia
</div> </br>

Nowadays, not a week passes without a story in the press about the impact of covid-19 on mental health and more specifically on suicides.  Claims on social media seem to appear daily and discussions on these topics are getting a huge attention. Therefore, we want to analyze the socio-economics effects on suicides, over the years, in different countries and generations, so that to better understand some of the reasons behind this illness.


For the complete documents:
* ##### [Full report](./docs/report.pdf)
* ##### [Presentation slides](./docs/slides.pdf)


## Data & methodology
We are using the **Suicide Rates Overview 1985 to 2016** dataset from Kaggle [1], that was in turn taken from the **World Health Organization** dataset [2]. It contains *27.8k* valid entries with the following attributes: *country, year, sex, age, \# suicide_no, \# population, \# suicides/100k pop, country-year, HDI for year, gdp_for_year, gdp_per_capita, generation*.

The service is composed by the following visualizations:
* **Map** [ #suicides/100k population colorscale ] (select one or more countries)
    * It allows zoom and pan
    * On country selected, **Age chart** will show only the related deaths
    * On country selected, **Sex chart** will show only the related deaths
    * On country selected, **PCA** will be replaced by the **Radar chart** that shows all the main information about the selected cuntry
    * On country selected, **Scatterplot** will be replaced by the **Line chart** that shows the Suicide radio over the years
    * On country selected, the other countries inside **Map** will reduce their opacity. We can select at
most three countries
    * On mouse over one country, the service shows a tooltip contains all the related information and the correspondent point on the **Scatterplot** is highlighted

* **PCA** 

*  **Sex bar chart** [ #suicides/100k population - sex ] (can select male or female)
    * On sex bar selection, **Age chart** will show only the related deaths
    * On sex bar selection, **Scatterplot** will show colors referring to related deaths
    * On sex bar selection, **Map** will show colors referring to related deaths
    * On mouse over one bar, the other bar shows the divergence to the current suicide ratio value
    * When the year selector has a value that is different than “All”, a slim bar is shown to compare the current data with the global data


* **Age bar chart** [ #suicides/100k population - age group ] (can select age group)
    * On age group selection, **Sex chart** will show only the related deaths
    * On age group selection, **Scatterplot** will show colors referring to related deaths
    * On age group selection, **Map** will show colors referring to related deaths
    * On age group selection, the average bar for only-selected-groups is updated
    * On mouse over one bar, the other bars show the divergence to the current suicide ratio value
    * When the year selector has a value that is different than “All”, a slim bar is shown to compare the current data with the global data

* **ScatterPlot** [ relationship GDP_year/GDP_capite - #suicides/100k population colorscale ] (brush on points)
    * On brush, **Scatterplot** will zoom over the selected points and the avg bars for the axis values are updated
    * On brush, **Age chart** will show only the related deaths
    * On brush, **Sex chart** will show only the related deaths
    * On brush, **Map** will show colors referring to related deaths
    * On mouse over one point, the service shows a tooltip contains all the related information and the correspondent country on the **Map** is highlighted

* **Line chart**

* **Radar chart** used to compare the paramaters of the seleced countries. Specifically compare: population, gdp per capita, gdp for year, # suicides and suicides rates

Moreover, the **interactive legend** shows has the following features:
* On mouse over a legend circle, **Map** will decrease the opacity of points that are not inside the range
* On mouse over a legend circle, **ScatterPlot** will decrease the opacity of points that are not inside the range
* On mouse over a legend circle, the service shows a tooltip contains all the countries that are inside that range
* When other visualizations update the values of suicide ratio, the blue outline used to denote the mean is updated;




Finally, an **year selector** is used to filter data in order to show only those related to the selected year. Every time a year diffrent than 'All' is selected, the bar charts show a second small bar for each group that is referred to the value without any filter applied.


## How to run
Make sure you have python3 installed, then run:
``` python run.py [port] ```

---
## Authors
* ##### [Manuel Ivagnes](https://www.linkedin.com/in/manuel-ivagnes-4a5ba018b)
* ##### [Riccardo Bianchini](http://linkedin.com/in/riccardo-bianchini-7a391219b)


---
## Reference dataset
[1] https://www.kaggle.com/russellyates88/suicide-rates-overview-1985-to-2016

[2] https://www.who.int/teams/mental-health-and-substance-use/suicide-data