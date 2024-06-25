import TopBar from "../components/TopBar.js";
import TikiMessage from "../components/TikiMessage.js";
import BottomBar from "../components/BottomBar.js";
import { initPlot } from "../audio.js";

export default {
    data() {
        return {
            graphDisplayed: "dotplot"
        }
    },
    components: {TopBar, TikiMessage, BottomBar},    
    template: `
    <TopBar @prev-click="prevClicked()" />
    <div class="flex-fill">
    <TikiMessage>Try record yourself pronouncing a vowel.</TikiMessage>
    <p class="text-center">Experiment with different vowels, and look at both views. What do you notice? When you're done, tap Continue.</p>
    <ul class="nav nav-pills nav-fill d-lg-none">
        <li class="nav-item">
            <a @click.prevent="changeDisplayedGraph('dotplot')" 
            class="nav-link text-uppercase"
            :class="{'active': graphDisplayed === 'dotplot'}"
            :aria-current="graphDisplayed === 'dotplot'"
            href="">
            Dot Plot
            </a>
        </li>
        <li class="nav-item">
        <a @click.prevent="changeDisplayedGraph('timeline')" 
            :class="{'active': graphDisplayed === 'timeline'}"
            :aria-current="graphDisplayed === 'timeline'"
            class="nav-link text-uppercase"
            href=""
        >Timeline</a>
        </li>
    </ul>
    <div class="d-flex">
        <div id="plot" class="d-lg-block" :class="{'d-none': graphDisplayed === 'timeline'}" ref="dotplot" style="width:100%;"></div>
        <div id="debug_plot" class="d-lg-block" :class="{'d-none': graphDisplayed === 'dotplot'}" ref="timeline"></div>
    </div>
    <div class="text-center">
        <button id="record" class="btn btn-primary"><i class="bi bi-mic"></i>Record</button>
    </div>
    </div>
    <BottomBar :isContinueEnabled="false" />
    `,
    methods: {
        prevClicked() {
            window.location.hash = "/";
        },
        changeDisplayedGraph(graphName) {
            this.graphDisplayed = graphName;
            // Hack to temporarily fix buggy labels.
            initPlot(this.$refs.dotplot);
        }
    },
    mounted() {
        initPlot(this.$refs.dotplot);
        Plotly.newPlot(this.$refs.timeline, [], {
            xaxis: {
                title: "Time (s)"
            },
            yaxis: {
                title: "Bark scale frequency"
            },
            hovermode: "x"
        });
    }
};