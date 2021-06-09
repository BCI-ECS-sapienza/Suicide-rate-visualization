# Suicide rate analysis over countries, years and generations

<div align="center">
Mental heath: "a state of well-being in which the individual realizes his or her own abilities, can cope with the normal stresses of life, can work productively and fruitfully, and is able to make a contribution to his or her community" - Wikipedia
</div> </br>

Nowadays, not a week passes without a story in the press about the impact of covid-19 on suicide. Claims on social media seem to appear daily and discussions about mental health are getting a huge attention. Therefore, in this project, we want to analyse the socio-economics effects on suicides, over the years, in different countries and generations (Unfortunately, we did not find any suitable/updated dataset to analyse the pandemic effect. Our project will instead cover past years, that still consider less relevant crisis).


For the complete documents:
* ##### [Full report](./docs/report.pdf)
* ##### [Presentation slides](./docs/slides.pdf)


## Data & methodology
We are using the **Suicide Rates Overview 1985 to 2016** dataset from Kaggle [1], that was in turn taken from the **World Health Organization** dataset [2]. It contains *27.8k* valid entries with the following attributes: *country, year, sex, age, \# suicide_no, \# population, \# suicides/100k pop, country-year, HDI for year, gdp_for_year, gdp_per_capita, generation*.

The service is composed by the following visualizations:
*  **Sex bar chart** [ #suicides/100k population - sex ] (can select male or female)
    * On sex selection, **Age chart** will show only the related deaths
    * On sex selection, **Scatterplot** will show colors referring to related deaths
    * On sex selection, **Map** will show colors referring to related deaths
    * When the cursor is over one bar, the other bar shows the divergence to the current suicide ratio value

* **Age bar chart** [ #suicides/100k population - age group ] (can select age group)
    * On age group selection, **Sex chart** will show only the related deaths
    * On age group selection, **Scatterplot** will show colors referring to related deaths
    * On age group selection, **Map** will show colors referring to related deaths
    * On age group selection, the average bar for only-selected-groups is updated
    * When the cursor is over one bar, the other bars show the divergence to the current suicide ratio value

* **ScatterPlot** [ relationship GDP_year/GDP_capite - #suicides/100k population colorscale ] (brush on points)
    * On points brush, **Scatterplot** will zoom over the selected points and the avg bars for the axis values are updated
    * On points brush, **Age chart** will show only the related deaths
    * On points brush, **Sex chart** will show only the related deaths
    * On points brush, **Map** will show colors referring to related deaths
    * When the cursor is over one point, the service shows a tooltip contains all the related information and the correspondent country on the **Map** is highlighted

* **PCA** 

* **Map** [ #suicides/100k population colorscale ] (select one or more countries)
    * On country selected, **Age chart** will show only the related deaths
    * On country selected, **Sex chart** will show only the related deaths
    * On country selected, **PCA** will be replaced by the **Radar chart** that shows all the main information about the selected cuntry
    * On country selected, **Scatterplot** will be replaced by the **Line chart** that shows the Suicide radio over the years
    * On country selected, the other countries inside **Map** will reduce their opacity
    * When the cursor is over one country, the service shows a tooltip contains all the related information and the correspondent point on the **Scatterplot** is highlighted

Moreover, the **interactive legend** shows has the following features:
* On mouse over range point, **Map** will decrease the opacity of points that are not inside the range
* On mouse over range point, **ScatterPlot** will decrease the opacity of points that are not inside the range
* When the cursor is over one range point, the service shows a tooltip contains all the countries that are inside that range




Finally, an **year selector** is used to filter data in order to show only those related to the selected year. Every time a year diffrent than 'All' is selected, the bar charts show a second small bar for each group that is referred to the value without any filter applied.


## How to run
Make sure you have python3 installed, then run:
``` python run.py [port] ```

---
## Authors
* ##### [Manuel Ivagnes](https://www.linkedin.com/in/manuel-ivagnes-4a5ba018b)
* ##### [Riccardo Bianchini](http://linkedin.com/in/riccardo-bianchini-7a391219b)


---
## Reference papers and material
[1] https://www.kaggle.com/russellyates88/suicide-rates-overview-1985-to-2016
[2] https://www.who.int/teams/mental-health-and-substance-use/suicide-data