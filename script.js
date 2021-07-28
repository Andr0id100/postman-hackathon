var margin = { top: 40, right: 10, bottom: 10, left: 40 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

var svg = d3.select(".board")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform",
        `translate(0, ${margin.top})`)

RADIUS = 80
SEASON_COUNT = 10

EPISODE_SIZE = 8
EPISODE_ANGLE = 10 / 180 * Math.PI

let dataFiles = [
    "got.json",
    "friends.json",
    // "lod.json", 
    // "ldr.json", 
    "hoc.json",
    "lucifer.json",
    "suits.json",
    "bb.json",
    // "sherlock.json",
    "tgd.json",
    // "the-expanse.json",
    "mrr.json",

]

const RED = "#F54748"
const GREEN = "#66DE93"

let angleScale = d3.scaleLinear()
    .domain([0, dataFiles.length - 1])
    .range([Math.PI / 180 * 0, Math.PI / 2 - EPISODE_ANGLE])

let ratingScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0 * EPISODE_ANGLE, EPISODE_ANGLE])

let episodeLabel = d3.select(".episodeName")
let ratingLabel = d3.select(".rating")

function appendCircles() {
    let episodeBoundaries = svg.append("g")

    episodeBoundaries.selectAll("circle")
        .data(_.range(RADIUS, RADIUS * (SEASON_COUNT + 2), RADIUS))
        .enter()
        .append("circle")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("cx", 0)
        .attr("cy", height)
        .attr("r", d => d)

}

function appendLabels() {

    lineLabels = svg.append("g")

    lineLabels.selectAll("line")
        .data(_.range(0, dataFiles.length))
        .enter()
        .append("line")
        .attr("stroke", "white")
        .attr("x1", d => (RADIUS) * Math.cos(angleScale(d) + + EPISODE_ANGLE / 2))
        .attr("y1", d => height - (RADIUS) * Math.sin(angleScale(d) + EPISODE_ANGLE / 2))
        .attr("x2", d => ((SEASON_COUNT + 1) * RADIUS) * Math.cos(angleScale(d) + EPISODE_ANGLE / 2))
        .attr("y2", d => height - ((SEASON_COUNT + 1) * RADIUS) * Math.sin(angleScale(d) + EPISODE_ANGLE / 2))


}

function appendSeason(show, showAverage, season, seasonData, xScale) {
    // tempData = seasonData.map(d => eval(d.imdbRating))
    // tempData = tempData.filter(d => d != 0)
    // showAverage = _.mean(tempData)

    episodes = svg.append("g")

    episodes.selectAll(".episode")
        .data(seasonData)
        .enter()
        .append("path")
        .classed("episode", true)
        .attr("fill", d => {
            if (d.imdbRating == 0) {
                return "black"
            }

            if (d.imdbRating < showAverage) {
                return RED
            }
            else {
                return GREEN
            }
        })
        .attr("stroke", "steelblue")
        .attr("stroke-width", 0.5)

        .attr("d", d3.arc()
            .innerRadius((d, i) => {
                return 2 + (season) * RADIUS + xScale(i)
            })
            .outerRadius((d, i) => {
                return 2 + (season) * RADIUS + xScale(i) + EPISODE_SIZE
            })
            .startAngle(angleScale(show))
            .endAngle(d => angleScale(show) + ratingScale(d.imdbRating == 0 ? 5 : d.imdbRating))
        )
        .attr("fill-opacity", 1)
        .attr("transform", (d, i) => `translate(0, ${height}) `)
        .on("mouseover", (event, d) => {
            d3.selectAll(".episode")
                .attr("fill-opacity", 0.1)

            d3.select(event.fromElement)
                .attr("fill-opacity", 1)

            episodeLabel.text(d.Title)
            ratingLabel.text("S" + ("00" + season).slice(-2) + "E" + ("00" + d.Episode).slice(-2) + " Rating: " + (d.imdbRating == 0 ? "N/A" : d.imdbRating))
        })
        .on("mouseout", (event, d) => {
            d3.selectAll(".episode")
                .attr("fill-opacity", 1)

            episodeLabel.text("")
            ratingLabel.text("")
        })



}

function appendShow(data, show) {
    svg.append("text")
        .text(data[0].Title)
        .attr("x", ((SEASON_COUNT + 1.2) * RADIUS) * Math.cos(angleScale(dataFiles.length - 1 - show) + EPISODE_ANGLE / 2))
        .attr("y", height - ((SEASON_COUNT + 1.2) * RADIUS) * Math.sin(angleScale(dataFiles.length - 1 - show) + EPISODE_ANGLE / 2))
        .attr("fill", "white")

    let totalRating = 0
    let ratingCount = 0
    data.forEach(season => {
        season["Episodes"].forEach(episode => {
            if (episode.imdbRating == "N/A") {
                episode.imdbRating = 0
            }
            else {
                totalRating += eval(episode.imdbRating)
                ratingCount += 1
            }
        })
    })

    let xScale = d3.scaleLinear()
        .domain([0, _.max(data.map(d => d.Episodes.length))])
        .range([1, RADIUS - 8])

    data.forEach(d => appendSeason(
        show,
        totalRating / ratingCount,
        eval(d.Season),
        d["Episodes"],
        xScale)
    )


}


dataFiles.forEach((fileName, index) => {
    d3.json(`data/${fileName}`).then(data => {
        appendShow(data, index)
    })
})

appendCircles()
appendLabels()
