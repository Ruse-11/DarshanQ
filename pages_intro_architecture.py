# -*- coding: utf-8 -*-
"""
pages_intro_architecture.py
Pages 5 - 16:
- Pages 5 to 8: Chapter 1: Introduction & Objectives
- Pages 9 to 10: Chapter 2: Related Work & Literature Review
- Page 11: Chapter 3: System Analysis & Requirements
- Pages 12 to 16: Chapter 4: System Architecture & Design
"""

def load_pages(add_page):

    # ----------------------------------------------------
    # PAGE 5: CHAPTER 1 - INTRODUCTION & BACKGROUND
    # ----------------------------------------------------
    p5_html = """
    <h1 class="chapter-title">CHAPTER 1: INTRODUCTION</h1>

    <h2 class="section-title">1.1 Overview & Socio-Cultural Context</h2>
    <p>
      India's pilgrimage economy is vast, drawing hundreds of millions of devotees annually to monumental historic temples. Prominent sanctuaries like the Venkateswara Temple at Tirumala, Kashi Vishwanath in Varanasi, Vaishno Devi in Jammu, and Sabarimala in Kerala function not merely as places of worship, but as ultra-dense logistical transit hubs. On auspicious dates, festivals (e.g., Brahmotsavam, Makaravilakku, Shivaratri), and weekends, daily footfalls surge exponentially beyond nominal holding limits, often crossing 100,000 visitors per 24-hour cycle.
    </p>

    <p>
      Managing this scale of human movement presents immense operational challenges. Unlike transit terminals (airports, railway stations) where passenger flows are metered by ticketed seat capacities, pilgrimage complexes face unpredictable, semi-continuous arrivals. Historically, temple administrations have managed surges using physical crowd control techniques developed decades ago: static zig-zag metal barricades, compartmentalized holding cages, and manual physical cordons.
    </p>

    <h2 class="section-title">The Physical Barricade Paradigm</h2>
    <p>
      Devotees arriving at the temple grounds are directed into narrow, barricaded lanes designed to throttle forward motion through frictional resistance. To prevent surges at the inner sanctum, pilgrims are periodically locked inside high-density holding compartments (referred to as <em>compartments</em> or <em>sheds</em>) for hours at a time. Within these enclosures, movement is completely halted until downstream security personnel open the next gate.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Temple Site</th>
          <th>Avg. Daily Footfall</th>
          <th>Peak Festival Surges</th>
          <th>Avg. Physical Wait Time</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Tirumala (Tirupati)</td><td>65,000 – 85,000</td><td>120,000+</td><td>8 – 16 Hours</td></tr>
        <tr><td>Vaishno Devi</td><td>35,000 – 50,000</td><td>85,000+</td><td>5 – 10 Hours</td></tr>
        <tr><td>Sabarimala</td><td>40,000 – 70,000</td><td>110,000+</td><td>7 – 14 Hours</td></tr>
        <tr><td>Puri Jagannath</td><td>30,000 – 45,000</td><td>90,000+</td><td>4 – 9 Hours</td></tr>
      </tbody>
    </table>

    <p>
      While physical compartmentalization prevents direct physical surges at the altar, it creates an oppressive, high-stress environment characterized by sensory deprivation, severe fatigue, and complete operational opacity.
    </p>
    """

    p5_md = """
# CHAPTER 1: INTRODUCTION

## 1.1 Overview & Socio-Cultural Context
India's pilgrimage economy is vast, drawing hundreds of millions of devotees annually to monumental historic temples. Prominent sanctuaries like the Venkateswara Temple at Tirumala, Kashi Vishwanath in Varanasi, Vaishno Devi in Jammu, and Sabarimala in Kerala function not merely as places of worship, but as ultra-dense logistical transit hubs. On auspicious dates, daily footfalls surge exponentially beyond nominal holding limits, often crossing 100,000 visitors per 24-hour cycle.

Managing this scale of human movement presents immense operational challenges. Historically, temple administrations have managed surges using physical crowd control techniques developed decades ago: static zig-zag metal barricades, compartmentalized holding cages, and manual physical cordons.

### The Physical Barricade Paradigm
Devotees arriving at temple grounds are directed into narrow, barricaded lanes designed to throttle forward motion. To prevent surges at the inner sanctum, pilgrims are locked inside high-density holding compartments for hours at a time.

| Temple Site | Avg. Daily Footfall | Peak Festival Surges | Avg. Physical Wait Time |
| :--- | :--- | :--- | :--- |
| Tirumala (Tirupati) | 65,000 – 85,000 | 120,000+ | 8 – 16 Hours |
| Vaishno Devi | 35,000 – 50,000 | 85,000+ | 5 – 10 Hours |
| Sabarimala | 40,000 – 70,000 | 110,000+ | 7 – 14 Hours |
| Puri Jagannath | 30,000 – 45,000 | 90,000+ | 4 – 9 Hours |
    """
    add_page(5, "Chapter 1: Introduction & Background", p5_html, p5_md)

    # ----------------------------------------------------
    # PAGE 6: 1.2 PROBLEM DEFINITION & BOTTLENECK ANALYSIS
    # ----------------------------------------------------
    p6_html = """
    <h2 class="section-title">1.2 Problem Definition: The Physical Queue Crisis</h2>
    <p>
      The traditional paradigm of temple crowd management suffers from four systemic structural vulnerabilities:
    </p>

    <h3 class="sub-title">1. The "Black Box" Queue & Zero Velocity Visibility</h3>
    <p>
      Devotees entering the queue have zero information regarding actual waiting times, clearance velocity, or internal delays. Administrative signboards, when present, display static estimates that fail to reflect real-time bottlenecks. This psychological vacuum breeds anxiety, frustration, and unrest among pilgrims who have traveled long distances with families.
    </p>

    <h3 class="sub-title">2. Physical Exhaustion & Vulnerable Demographic Distress</h3>
    <p>
      Pilgrims comprise elderly citizens, small children, pregnant women, and physically disabled devotees. Forcing these vulnerable individuals to stand upright for 6 to 12 hours in unventilated, crowded metal barricades leads to acute dehydration, heat exhaustion, fainting spells, and hypertensive crises. Emergency medical responders face severe difficulties accessing patients trapped deep within locked barricades.
    </p>

    <h3 class="sub-title">3. Dangerous Crush Dynamics & Stampede Vulnerabilities</h3>
    <p>
      When holding compartments are opened, or when sudden bottlenecks occur near the sanctum sanctorum, differential pressure waves propagate through the crowd. Devotees at the rear, unaware of downstream obstructions, push forward, inducing crowd collapses and asphyxiation risks. Tragic historical stampedes across major pilgrimage shrines underscore the fatal dangers of relying exclusively on physical barriers.
    </p>

    <div class="diagram-panel">
TRADITIONAL CROWD PARADIGM (UNMANAGED PHYSICAL COMPRESSION):
[Open Courtyard] ──> [Zig-Zag Barricades] ──> [Locked Compartment] ──> [Altar Crush]
     ▲                       │                       │                     │
No Ingress Control     Severe Fatigue          Zero Information       Stampede Risk
    </div>

    <h3 class="sub-title">4. Operational Blind Spots for Temple Administration</h3>
    <p>
      Temple authorities lack unified, real-time spatial intelligence. Security personnel at Entrance Gate 1 cannot see queue buildup at Checkpoint 3, and administrators in the central office rely on voice walkie-talkies rather than quantitative density metrics. Consequently, interventions are reactive, deployed only after a crowd surge has already formed.
    </p>
    """

    p6_md = """
## 1.2 Problem Definition: The Physical Queue Crisis
The traditional paradigm of temple crowd management suffers from four systemic structural vulnerabilities:

### 1. The "Black Box" Queue & Zero Velocity Visibility
Devotees entering the queue have zero information regarding actual waiting times, clearance velocity, or internal delays. Administrative signboards display static estimates that fail to reflect real-time bottlenecks.

### 2. Physical Exhaustion & Vulnerable Demographic Distress
Pilgrims comprise elderly citizens, small children, and physically disabled devotees. Forcing these vulnerable individuals to stand upright for 6 to 12 hours leads to acute dehydration, fainting, and medical distress. Emergency access is severely compromised.

### 3. Dangerous Crush Dynamics & Stampede Vulnerabilities
When holding compartments open or bottlenecks occur near the sanctum, pressure waves propagate through the crowd. Devotees at the rear push forward, inducing crush dynamics. Tragic historical stampedes underscore these fatal dangers.

```
TRADITIONAL CROWD PARADIGM (UNMANAGED PHYSICAL COMPRESSION):
[Open Courtyard] ──> [Zig-Zag Barricades] ──> [Locked Compartment] ──> [Altar Crush]
     ▲                       │                       │                     │
No Ingress Control     Severe Fatigue          Zero Information       Stampede Risk
```

### 4. Operational Blind Spots for Temple Administration
Temple authorities lack unified, real-time spatial intelligence. Personnel rely on fragmented walkie-talkie communication, rendering administrative responses reactive rather than preventative.
    """
    add_page(6, "Problem Definition & Bottleneck Analysis", p6_html, p6_md)

    # ----------------------------------------------------
    # PAGE 7: 1.3 OBJECTIVES & 1.4 PROJECT SCOPE
    # ----------------------------------------------------
    p7_html = """
    <h2 class="section-title">1.3 Project Objectives</h2>
    <p>
      The primary mission of <strong>DarshanQ</strong> is to replace physical queues with an intelligent, transparent virtual orchestration framework. The specific engineering objectives are:
    </p>

    <ol style="margin: 4px 0 8px 18px; font-size: 8.5pt; line-height: 1.4;">
      <li><strong>Virtual Tokenization:</strong> Engineer a role-based booking portal where devotees reserve cryptographic digital passes linked to specific entry lanes, eliminating physical standing.</li>
      <li><strong>Topological Flow Modeling:</strong> Formulate the temple layout as a directed acyclic graph (3 Gates ➔ 3 Checkpoints ➔ 1 Sanctum) to model physical pilgrim progression accurately.</li>
      <li><strong>Deterministic Queue Intelligence:</strong> Develop an explainable mathematical engine that calculates remaining wait times from empirical 15-minute scanning velocity ($W = N_{ahead} / R_{scan}$).</li>
      <li><strong>Zero-Latency Synchronization:</strong> Implement bi-directional WebSockets (Socket.IO) to push queue position decrements and density alerts to clients with sub-second latency.</li>
      <li><strong>Staff Operational Ergonomics:</strong> Build a zero-scroll, tap-to-scan staff interface enabling security personnel to verify and advance tokens with one-click efficiency.</li>
      <li><strong>Executive Situational Awareness:</strong> Provide administrators with an interactive flow map displaying live density heatmaps (Low, Moderate, High) and operational throughput KPIs.</li>
      <li><strong>Omni-Channel Outreach:</strong> Integrate a Telegram Bot service to alert devotees on their smartphones when their turn approaches without requiring an active browser window.</li>
    </ol>

    <h2 class="section-title">1.4 Scope of the Project</h2>
    <p>
      To ensure focused execution and rigorous validation within the academic Full Stack Development framework, the project defines the following boundaries:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 50%;">In-Scope Deliverables</th>
          <th style="width: 50%;">Out-of-Scope (Future Iterations)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Full-stack responsive web client (React 18 + Vite)</td>
          <td>Hardware IoT turnstiles & biometric scanners</td>
        </tr>
        <tr>
          <td>Express REST API & Socket.IO server engine</td>
          <td>CCTV Computer Vision crowd analysis models</td>
        </tr>
        <tr>
          <td>Cloud-hosted PostgreSQL (Supabase SSL) schema</td>
          <td>Payment gateway for paid VIP darshan tickets</td>
        </tr>
        <tr>
          <td>Simulated staff scanning terminal (+1 rapid pass)</td>
          <td>Multi-temple enterprise cloud federation</td>
        </tr>
        <tr>
          <td>Deterministic, explainable queue velocity heuristics</td>
          <td>Black-box machine learning wait-time models</td>
        </tr>
        <tr>
          <td>Telegram Bot webhook/polling notification engine</td>
          <td>Native iOS/Android compiled binary mobile apps</td>
        </tr>
      </tbody>
    </table>
    """

    p7_md = """
## 1.3 Project Objectives
The primary mission of **DarshanQ** is to replace physical queues with an intelligent, transparent virtual orchestration framework:

1. **Virtual Tokenization:** Engineer a role-based portal where devotees reserve digital passes.
2. **Topological Flow Modeling:** Formulate the temple layout as a directed graph (3 Gates ➔ 3 Checkpoints ➔ 1 Sanctum).
3. **Deterministic Queue Intelligence:** Implement an explainable mathematical engine based on empirical 15-minute scanning velocities ($W = N_{ahead} / R_{scan}$).
4. **Zero-Latency Synchronization:** Implement bi-directional WebSockets (Socket.IO) for sub-second client updates.
5. **Staff Operational Ergonomics:** Build a zero-scroll, tap-to-scan terminal for rapid token verification.
6. **Executive Situational Awareness:** Provide administrators with real-time density heatmaps and KPIs.
7. **Omni-Channel Outreach:** Integrate a Telegram Bot service for out-of-app smartphone alerts.

## 1.4 Scope of the Project

| In-Scope Deliverables | Out-of-Scope (Future Iterations) |
| :--- | :--- |
| Full-stack responsive web client (React + Vite) | Hardware IoT turnstiles & biometric scanners |
| Express REST API & Socket.IO server engine | CCTV Computer Vision crowd analysis models |
| Cloud-hosted PostgreSQL (Supabase SSL) database | Payment gateway for paid VIP darshan passes |
| Simulated staff scanning terminal (+1 rapid pass) | Multi-temple enterprise cloud federation |
| Deterministic, explainable queue velocity heuristics | Black-box machine learning wait-time models |
| Telegram Bot webhook/polling notification service | Native iOS/Android compiled binary mobile apps |
    """
    add_page(7, "Objectives & Scope of the Project", p7_html, p7_md)

    # ----------------------------------------------------
    # PAGE 8: 1.5 MOTIVATION & SOCIETAL IMPACT
    # ----------------------------------------------------
    p8_html = """
    <h2 class="section-title">1.5 Motivation & Societal Impact</h2>
    <p>
      The conception of DarshanQ is driven by profound humanitarian, ethical, and administrative imperatives. Pilgrimage is an intrinsic expression of faith in Indian society; forcing citizens to endure physical agony to experience spiritual solace represents a failure of civil logistics that modern computing can solve.
    </p>

    <h3 class="sub-title">1. Restoring Dignity & Health Protection to Pilgrims</h3>
    <p>
      By virtualizing the queue, DarshanQ completely decouples <em>waiting for Darshan</em> from <em>physical immobilization</em>. A devotee booking a virtual pass can rest in a designated community mandapam, eat in dining halls, or remain in hotel accommodations until their assigned time window. This directly alleviates the physical trauma inflicted on senior citizens, infants, and chronically ill pilgrims, transforming the pilgrimage into a safe, dignified experience.
    </p>

    <h3 class="sub-title">2. Democratizing Access & Eliminating Nepotistic Discretion</h3>
    <p>
      In conventional physical systems, queue management often degenerates into arbitrary favoritism, where influential patrons or informal agents bypass hours of standing through VIP shortcuts. DarshanQ enforces cryptographic queuing discipline: every token is assigned a sequential number and a unique identifier (<code>devotee_code</code>), strictly timestamped and validated at every checkpoint. Transparency restores public trust in temple governance.
    </p>

    <h3 class="sub-title">3. Preventing Catastrophic Mass Casualties</h3>
    <p>
      Crowd disasters are rarely caused by malicious intent; they are thermodynamic failures of crowd fluid dynamics where physical density exceeds 4 to 6 persons per square meter, inducing compressive asphyxiation. DarshanQ's topological tracking acts as an early warning radar: administrators monitor station density thresholds and can throttle incoming gate admissions before local densities reach dangerous critical thresholds.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Dimension</th>
          <th>Traditional Physical Queue</th>
          <th>DarshanQ Orchestrated System</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Physical Standing Time</strong></td>
          <td>6 to 12 Hours continuous standing</td>
          <td>15 to 30 Minutes (Final lane ingress only)</td>
        </tr>
        <tr>
          <td><strong>Devotee Situational Awareness</strong></td>
          <td>Zero (Black box opacity)</td>
          <td>Real-time countdown, velocity, route map</td>
        </tr>
        <tr>
          <td><strong>Stampede Vulnerability</strong></td>
          <td>High (Uncontrolled barricade surges)</td>
          <td>Extremely Low (Metered topological flow)</td>
        </tr>
        <tr>
          <td><strong>Medical Emergency Access</strong></td>
          <td>Severely impeded by locked cages</td>
          <td>Devotees located in open, accessible zones</td>
        </tr>
        <tr>
          <td><strong>Administrative Command</strong></td>
          <td>Fragmented walkie-talkie reports</td>
          <td>Centralized real-time density dashboard</td>
        </tr>
      </tbody>
    </table>
    """

    p8_md = """
## 1.5 Motivation & Societal Impact

The conception of DarshanQ is driven by profound humanitarian, ethical, and administrative imperatives:

### 1. Restoring Dignity & Health Protection to Pilgrims
By virtualizing the queue, DarshanQ completely decouples *waiting for Darshan* from *physical immobilization*. Devotees can rest in open mandapams or hotel accommodations until their turn arrives, directly mitigating health risks for senior citizens and infants.

### 2. Democratizing Access & Eliminating Nepotistic Discretion
DarshanQ enforces cryptographic queue discipline: every token is assigned a sequential number and a unique `devotee_code`, strictly timestamped and validated at every checkpoint. Transparency eliminates arbitrary VIP overrides.

### 3. Preventing Catastrophic Mass Casualties
Crowd crushes occur when physical densities exceed 4 to 6 persons per square meter. DarshanQ's topological tracking acts as an early warning system, allowing administrators to balance inflows before critical thresholds are breached.

| Dimension | Traditional Physical Queue | DarshanQ Orchestrated System |
| :--- | :--- | :--- |
| **Physical Standing Time** | 6 to 12 Hours continuous standing | 15 to 30 Minutes (Final lane ingress only) |
| **Devotee Awareness** | Zero (Black box opacity) | Real-time countdown, velocity, route map |
| **Stampede Vulnerability** | High (Barricade surges) | Extremely Low (Metered topological flow) |
| **Medical Access** | Severely impeded by locked cages | Devotees located in open, accessible zones |
| **Administrative Command** | Fragmented walkie-talkies | Centralized real-time density dashboard |
    """
    add_page(8, "Motivation & Societal Welfare Impact", p8_html, p8_md)

    # ----------------------------------------------------
    # PAGE 9: CHAPTER 2 - RELATED WORK & LITERATURE REVIEW
    # ----------------------------------------------------
    p9_html = """
    <h1 class="chapter-title">CHAPTER 2: RELATED WORK</h1>

    <h2 class="section-title">2.1 Literature Review on Queueing Systems & Crowd Dynamics</h2>
    <p>
      The mathematical modeling of waiting lines originated in the early 20th century with A.K. Erlang's pioneering work on telecommunication traffic, later generalized into classical Queueing Theory ($M/M/1$, $M/M/c$ models). In 1961, John Little formulated <strong>Little's Law</strong>:
    </p>
    <div class="formula-callout">
      $$L = \\lambda W$$
      <em>Where $L$ is the average number of entities in the system, $\\lambda$ is the long-term average arrival rate, and $W$ is the average time an entity spends in the system.</em>
    </div>

    <p>
      While Little's Law provides steady-state equilibrium bounds, human pilgrimage crowds violate Poisson arrival assumptions due to bursty, correlated arrivals during festival peaks. Furthermore, Helbing et al. (2000) demonstrated that human crowds exhibit fluid-like "turbulent flow" under extreme density (>5 persons/$m^2$), transitioning from smooth laminar flow to shockwaves that precipitate catastrophic stampedes. Effective crowd mitigation requires active throttling of ingress rates to preserve sub-critical density states.
    </p>

    <h2 class="section-title">Analysis of Existing Solutions</h2>
    <h3 class="sub-title">1. Tirumala Tirupati Devasthanams (TTD) Slotted Darshan</h3>
    <p>
      TTD pioneered online slotted ticket bookings and physical "SSD" (Sarva Darshan) counter tokens. However, the system requires pilgrims to pre-book months in advance or stand in physical counter queues at 3 AM to obtain wristbands. Crucially, once inside the temple complex, devotees are still routed into holding compartments for 4 to 8 hours with zero real-time queue velocity tracking.
    </p>

    <h3 class="sub-title">2. Theme Park Virtual Systems (Disney Genie+ / FastPass)</h3>
    <p>
      Commercial leisure systems (Disney, Universal) utilize proprietary smartphone applications to assign virtual return windows. While highly effective, these systems are optimized for commercial upselling and individual ride kiosks, lacking the multi-lane convergence topologies and high-throughput bulk scanning essential for religious mass pilgrimages.
    </p>

    <h3 class="sub-title">3. General Hospital & Banking Queuing Apps (QLess, Waitwhile)</h3>
    <p>
      Commercial SMS queue management platforms excel at single-station service desks (e.g., doctor consultations, bank tellers). However, they cannot model multi-stage spatial topologies where pilgrims must pass sequential security checks, luggage screening, and sanctum checkpoints with interconnected flow rates.
    </p>
    """

    p9_md = """
# CHAPTER 2: RELATED WORK

## 2.1 Literature Review on Queueing Systems & Crowd Dynamics
The mathematical modeling of waiting lines originated with A.K. Erlang's pioneering work, later generalized into classical Queueing Theory ($M/M/1$, $M/M/c$ models). In 1961, John Little formulated **Little's Law**:

$$L = \\lambda W$$

*Where $L$ is the average entities in system, $\\lambda$ is the arrival rate, and $W$ is average waiting time.*

Helbing et al. (2000) demonstrated that human crowds exhibit fluid-like "turbulent flow" under extreme density (>5 persons/$m^2$), transitioning into dangerous shockwaves. Preventing disasters requires actively throttling ingress rates.

## Analysis of Existing Solutions

### 1. Tirumala Tirupati Devasthanams (TTD) Slotted Darshan
TTD pioneered online slotted ticket bookings and physical wristband tokens. However, devotees must book months in advance, and once inside the temple complex, they are still locked inside holding compartments for 4 to 8 hours without real-time velocity updates.

### 2. Commercial Theme Park Systems (Disney Genie+ / FastPass)
Commercial leisure systems utilize virtual return windows. However, these systems are designed for individual ride kiosks and commercial monetization, lacking multi-lane topological convergence models.

### 3. General Service Queuing Apps (QLess, Waitwhile)
Commercial platforms manage single-station service desks (banks, hospitals). They fail to model multi-stage spatial topologies where pilgrims must traverse sequential security checkpoints.
    """
    add_page(9, "Chapter 2: Related Work & Literature Review", p9_html, p9_md)

    # ----------------------------------------------------
    # PAGE 10: 2.2 EXISTING SYSTEM LIMITATIONS VS 2.3 PROPOSED DARSHANQ
    # ----------------------------------------------------
    p10_html = """
    <h2 class="section-title">2.2 Critical Limitations of Existing Queue Paradigms</h2>
    <p>
      A critical audit of legacy pilgrimage systems reveals three fundamental architectural deficiencies:
    </p>
    <ul style="margin: 4px 0 8px 18px; font-size: 8.5pt; line-height: 1.45;">
      <li><strong>Siloed Architecture:</strong> Ticketing databases are disconnected from physical checkpoint operations. Administrative servers do not know how many devotees have cleared security until hours later.</li>
      <li><strong>Lack of Real-Time Bi-Directional Telemetry:</strong> Devotees have no live feedback loop. When a delay occurs at the sanctum, devotees in holding sheds remain completely uninformed.</li>
      <li><strong>Rigid Spatial Routing:</strong> Conventional systems cannot dynamically redirect pilgrims from a congested entrance gate to an idle gate, leading to severe localized bottlenecks.</li>
    </ul>

    <h2 class="section-title">2.3 The Proposed DarshanQ System: A Paradigm Shift</h2>
    <p>
      DarshanQ fundamentally re-architects temple operations by unifying virtual booking, real-time telemetry, and directed topological flow control into a single cohesive platform.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Comparative Parameter</th>
          <th>Legacy Temple Systems (TTD SSD / Physical)</th>
          <th>Proposed DarshanQ Platform</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Queue Type</strong></td>
          <td>Physical holding compartments</td>
          <td>Cryptographic Virtual Pass + Directed Ingress</td>
        </tr>
        <tr>
          <td><strong>Wait-Time Computation</strong></td>
          <td>Static estimates or unstated</td>
          <td>Dynamic, explainable sliding scan velocity</td>
        </tr>
        <tr>
          <td><strong>Devotee Device Sync</strong></td>
          <td>Manual display boards or SMS blast</td>
          <td>Instant WebSocket push + Telegram Bot</td>
        </tr>
        <tr>
          <td><strong>Spatial Modeling</strong></td>
          <td>Linear single-lane pipeline</td>
          <td>Directed Graph (3 Gates ➔ 3 Checkpoints ➔ 1 Sanctum)</td>
        </tr>
        <tr>
          <td><strong>Gate Balancing</strong></td>
          <td>Manual security intervention</td>
          <td>Automated algorithmic load-balancing</td>
        </tr>
        <tr>
          <td><strong>Staff Verification</strong></td>
          <td>Manual wristband / paper tear</td>
          <td>Zero-scroll, rapid one-click digital terminal</td>
        </tr>
        <tr>
          <td><strong>Admin Intelligence</strong></td>
          <td>End-of-day tally sheets</td>
          <td>Real-time topological density heatmap & KPIs</td>
        </tr>
      </tbody>
    </table>

    <div class="diagram-panel">
DARSHANQ PARADIGM SHIFT:
Legacy:   [Crowd Influx] ──> [Physical Barricade] ──> [Blind Congestion] ──> [Intervention]
DarshanQ: [Virtual Pass] ──> [Directed Topology]  ──> [Real-time Telemetry] ──> [Continuous Balance]
    </div>
    """

    p10_md = """
## 2.2 Critical Limitations of Existing Queue Paradigms
A critical audit of legacy pilgrimage systems reveals three fundamental architectural deficiencies:
1. **Siloed Architecture:** Ticketing databases are disconnected from physical checkpoint operations.
2. **Lack of Real-Time Bi-Directional Telemetry:** Devotees have no live feedback loop when delays occur.
3. **Rigid Spatial Routing:** Inability to dynamically load-balance devotees across alternative entrance gates.

## 2.3 The Proposed DarshanQ System: A Paradigm Shift
DarshanQ fundamentally re-architects temple operations by unifying virtual booking, real-time telemetry, and directed topological flow control into a single cohesive platform.

| Comparative Parameter | Legacy Temple Systems (TTD SSD / Physical) | Proposed DarshanQ Platform |
| :--- | :--- | :--- |
| **Queue Type** | Physical holding compartments | Cryptographic Virtual Pass + Directed Ingress |
| **Wait-Time Computation** | Static estimates or unstated | Dynamic, explainable sliding scan velocity |
| **Devotee Device Sync** | Manual display boards / SMS blast | Instant WebSocket push + Telegram Bot |
| **Spatial Modeling** | Linear single-lane pipeline | Directed Graph (3 Gates ➔ 3 Checkpoints ➔ 1 Sanctum) |
| **Gate Balancing** | Manual security intervention | Automated algorithmic load-balancing |
| **Staff Verification** | Manual wristband / paper tear | Zero-scroll, rapid one-click digital terminal |
| **Admin Intelligence** | End-of-day tally sheets | Real-time topological density heatmap & KPIs |

```
DARSHANQ PARADIGM SHIFT:
Legacy:   [Crowd Influx] ──> [Physical Barricade] ──> [Blind Congestion] ──> [Intervention]
DarshanQ: [Virtual Pass] ──> [Directed Topology]  ──> [Real-time Telemetry] ──> [Continuous Balance]
```
    """
    add_page(10, "Existing Systems vs Proposed DarshanQ", p10_html, p10_md)

    # ----------------------------------------------------
    # PAGE 11: CHAPTER 3 - SYSTEM ANALYSIS & REQUIREMENTS
    # ----------------------------------------------------
    p11_html = """
    <h1 class="chapter-title">CHAPTER 3: SYSTEM ANALYSIS</h1>

    <h2 class="section-title">3.1 Functional Requirements Specification</h2>
    <p>
      The system requirements are organized across three distinct user roles:
    </p>
    <ul style="margin: 4px 0 8px 18px; font-size: 8.5pt; line-height: 1.4;">
      <li><strong>Devotee Role (FR-DEV):</strong>
        <ul>
          <li><em>FR-DEV-01:</em> User registration with unique phone validation and secure bcrypt password hashing.</li>
          <li><em>FR-DEV-02:</em> Virtual token issuance with manual entrance gate selection or automated queue balancing.</li>
          <li><em>FR-DEV-03:</em> Live pass visualization showing assigned token number, devotee code, status, and route tracker.</li>
          <li><em>FR-DEV-04:</em> Dynamic wait-time computation with transparent explainability cards showing inputs ($N_{ahead}, R_{scan}$).</li>
          <li><em>FR-DEV-05:</em> Token cancellation with instant database transaction rollback and queue recomputation.</li>
        </ul>
      </li>
      <li><strong>Staff Role (FR-STF):</strong>
        <ul>
          <li><em>FR-STF-01:</em> Zero-scroll topological overview displaying live queue depth and density state per station.</li>
          <li><em>FR-STF-02:</em> Tap-to-scan modal interface with continuous <code>+1 Pass Next Devotee</code> rapid throughput.</li>
          <li><em>FR-STF-03:</em> Multimodal token verification supporting UUID scan, integer token number, or alphanumeric devotee code.</li>
          <li><em>FR-STF-04:</em> Walk-in devotee fast registration for pilgrims arriving without smartphones.</li>
        </ul>
      </li>
      <li><strong>Administrator Role (FR-ADM):</strong>
        <ul>
          <li><em>FR-ADM-01:</em> Real-time temple-wide KPIs: active waiting, average wait time, completed darshans, and total scans.</li>
          <li><em>FR-ADM-02:</em> Station detail inspector with bottleneck risk indicators and velocity audits.</li>
          <li><em>FR-ADM-03:</em> Full devotee audit search tracing historical checkpoint traversal timestamps.</li>
        </ul>
      </li>
    </ul>

    <h2 class="section-title">3.2 Hardware and Software Requirements</h2>
    <table class="data-table" style="font-size: 7.6pt;">
      <thead>
        <tr>
          <th style="width: 25%;">Category</th>
          <th style="width: 38%;">Development / Server Specification</th>
          <th style="width: 37%;">Client Device Specification</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Operating System</strong></td>
          <td>Ubuntu 22.04 LTS / Windows 11 64-bit</td>
          <td>Android 10+, iOS 14+, Windows, macOS, Linux</td>
        </tr>
        <tr>
          <td><strong>Runtime & Engine</strong></td>
          <td>Node.js v20+ LTS, Express v4.19</td>
          <td>Modern Web Browser (Chrome 90+, Safari 14+)</td>
        </tr>
        <tr>
          <td><strong>Database Tier</strong></td>
          <td>Supabase PostgreSQL 15 (SSL Enabled)</td>
          <td>Zero local database footprint (Stateless client)</td>
        </tr>
        <tr>
          <td><strong>Real-Time Transport</strong></td>
          <td>Socket.IO v4.7 Engine (WebSocket / Polling)</td>
          <td>Socket.IO Client WebSocket adapter</td>
        </tr>
        <tr>
          <td><strong>Compute / Memory</strong></td>
          <td>Min. 2 vCPU, 4 GB RAM, 20 GB SSD</td>
          <td>Min. 1.5 GHz Dual Core, 2 GB RAM (Smartphone)</td>
        </tr>
        <tr>
          <td><strong>Network Bandwidth</strong></td>
          <td>100 Mbps uplink with WebSocket support</td>
          <td>3G / 4G / 5G / Temple Wi-Fi (>= 256 kbps)</td>
        </tr>
      </tbody>
    </table>
    """

    p11_md = """
# CHAPTER 3: SYSTEM ANALYSIS

## 3.1 Functional Requirements Specification
The system requirements are organized across three distinct user roles:

### Devotee Role (FR-DEV)
- **FR-DEV-01:** Registration with unique phone validation and bcrypt password hashing.
- **FR-DEV-02:** Virtual token issuance with gate selection or automated queue balancing.
- **FR-DEV-03:** Live pass visualization showing assigned token number, devotee code, and route tracker.
- **FR-DEV-04:** Dynamic wait-time computation with explainability cards ($N_{ahead}, R_{scan}$).
- **FR-DEV-05:** Token cancellation with instant queue recomputation.

### Staff Role (FR-STF)
- **FR-STF-01:** Zero-scroll topological overview displaying live queue depth and density state.
- **FR-STF-02:** Tap-to-scan modal interface with continuous `+1 Pass Next Devotee` rapid throughput.
- **FR-STF-03:** Multimodal token verification (UUID, token number, alphanumeric devotee code).
- **FR-STF-04:** Walk-in devotee fast registration.

### Administrator Role (FR-ADM)
- **FR-ADM-01:** Real-time temple KPIs: active waiting, average wait time, completed darshans, and total scans.
- **FR-ADM-02:** Station detail inspector with bottleneck risk indicators.
- **FR-ADM-03:** Full devotee audit search tracing historical checkpoint timestamps.

## 3.2 Hardware and Software Requirements

| Category | Development / Server Specification | Client Device Specification |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Windows 11 64-bit | Android 10+, iOS 14+, Desktop OS |
| **Runtime & Engine** | Node.js v20+ LTS, Express v4.19 | Modern Web Browser (Chrome 90+, Safari 14+) |
| **Database Tier** | Supabase PostgreSQL 15 (SSL Enabled) | Zero local footprint (Stateless) |
| **Real-Time Transport** | Socket.IO v4.7 Engine | Socket.IO Client WebSocket adapter |
| **Compute / Memory** | Min. 2 vCPU, 4 GB RAM, 20 GB SSD | Min. 1.5 GHz Dual Core, 2 GB RAM |
| **Network Bandwidth** | 100 Mbps uplink with WebSocket support | 3G / 4G / 5G / Temple Wi-Fi (>= 256 kbps) |
    """
    add_page(11, "Chapter 3: System Analysis & Requirements", p11_html, p11_md)

    # ----------------------------------------------------
    # PAGE 12: CHAPTER 4 - SYSTEM DESIGN & TIERED ARCHITECTURE
    # ----------------------------------------------------
    p12_html = """
    <h1 class="chapter-title">CHAPTER 4: SYSTEM DESIGN</h1>

    <h2 class="section-title">4.1 Tiered Client-Server-Database Architecture</h2>
    <p>
      DarshanQ is engineered using a decoupled, multi-tier architectural pattern combining stateless REST endpoints for transactional state changes with an asynchronous event-driven WebSocket layer for real-time state synchronization.
    </p>

    <div class="diagram-panel">
┌────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                           │
│   [ Devotee Portal ]          [ Staff Terminal ]    [ Admin Command ]  │
│   (React 18 + Vite)           (Zero-Scroll Map)     (KPI & Inspector)  │
└──────────────────┬─────────────────────┬──────────────────────┬────────┘
                   │ HTTP / REST         │ WebSockets           │ Telegram
                   ▼                     ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SERVER LAYER                       │
│   Node.js (v20+) & Express HTTP Server + Socket.IO Multiplexing Engine │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────┐ │
│  │ REST Router & RBAC    │ │ Queue Intelligence    │ │ Telegram Bot  │ │
│  │ /api/auth, /tokens,   │ │ waitTimeEngine.js     │ │ telegramBot.js│ │
│  │ /checkpoints, /admin  │ │ (15-min scan velocity)│ │ (Long Polling)│ │
│  └───────────┬───────────┘ └───────────┬───────────┘ └───────┬───────┘ │
└──────────────┼─────────────────────────┼─────────────────────┼─────────┘
               │ Connection Pool (SSL)   │ SQL Queries         │
               ▼                         ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                         │
│            Hosted Supabase PostgreSQL (Cloud Database Instance)        │
│   [users]   [temples]   [checkpoints]   [queue_tokens]   [logs]   ...  │
└────────────────────────────────────────────────────────────────────────┘
    </div>

    <h3 class="sub-title">Architectural Subsystems</h3>
    <ul style="margin: 4px 0 8px 18px; font-size: 8.5pt; line-height: 1.45;">
      <li><strong>Stateless RESTful API:</strong> Handles authentication, virtual token booking, cancellation, and manual administrative configuration under strict JWT role validation.</li>
      <li><strong>Stateful WebSocket Pub/Sub Engine:</strong> Maintains persistent duplex connections. When a checkpoint scan occurs, the server recalculates affected queue states and pushes targeted payloads into rooms (<code>temple:&lt;id&gt;</code> and <code>user:&lt;id&gt;</code>) without client-side polling.</li>
      <li><strong>Omni-Channel Telegram Daemon:</strong> Operates an independent asynchronous event loop that queries devotee tokens and dispatches mobile push notifications when proximity thresholds (tokens ahead &le; 2) are breached.</li>
    </ul>
    """

    p12_md = """
# CHAPTER 4: SYSTEM DESIGN

## 4.1 Tiered Client-Server-Database Architecture
DarshanQ is engineered using a decoupled, multi-tier architectural pattern combining stateless REST endpoints for transactional state changes with an asynchronous event-driven WebSocket layer for real-time synchronization.

```
┌────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                           │
│   [ Devotee Portal ]          [ Staff Terminal ]    [ Admin Command ]  │
│   (React 18 + Vite)           (Zero-Scroll Map)     (KPI & Inspector)  │
└──────────────────┬─────────────────────┬──────────────────────┬────────┘
                   │ HTTP / REST         │ WebSockets           │ Telegram
                   ▼                     ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SERVER LAYER                       │
│   Node.js (v20+) & Express HTTP Server + Socket.IO Multiplexing Engine │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────┐ │
│  │ REST Router & RBAC    │ │ Queue Intelligence    │ │ Telegram Bot  │ │
│  │ /api/auth, /tokens,   │ │ waitTimeEngine.js     │ │ telegramBot.js│ │
│  └───────────┬───────────┘ └───────────┬───────────┘ └───────┬───────┘ │
└──────────────┼─────────────────────────┼─────────────────────┼─────────┘
               │ Connection Pool (SSL)   │ SQL Queries         │
               ▼                         ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                         │
│            Hosted Supabase PostgreSQL (Cloud Database Instance)        │
│   [users]   [temples]   [checkpoints]   [queue_tokens]   [logs]   ...  │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Subsystems
1. **Stateless RESTful API:** Handles authentication, token creation, and administrative operations under strict JWT validation.
2. **Stateful WebSocket Pub/Sub Engine:** Pushes targeted updates into rooms (`temple:<id>` and `user:<id>`) without client polling.
3. **Omni-Channel Telegram Daemon:** Dispatches mobile push notifications when proximity thresholds are breached.
    """
    add_page(12, "Chapter 4: System Architecture & Tiered Design", p12_html, p12_md)

    # ----------------------------------------------------
    # PAGE 13: 4.2 TEMPLE FLOW TOPOLOGY & QUEUE MATH
    # ----------------------------------------------------
    p13_html = """
    <h2 class="section-title">4.2 Directed Graph Temple Topology & Queue Intelligence</h2>
    <p>
      Physical temple layout is modeled as a directed acyclic graph $G = (V, E)$, ensuring deterministic forward line-of-progression routing.
    </p>

    <div class="diagram-panel">
LEVEL 1 (Entry Gates):             [ Gate 1 ]         [ Gate 2 ]         [ Gate 3 ]
                                       │                  │                  │
                                       ▼                  ▼                  ▼
LEVEL 2 (Security Checkpoints):    [ Checkpoint 1 ]   [ Checkpoint 2 ]   [ Checkpoint 3 ]
                                       │                  │                  │
                                       └────────────────┬─┴──────────────────┘
                                                        ▼
LEVEL 3 (Sanctum Sanctorum):                       [ Sanctum ]
                                              (Final Completion)
    </div>

    <h3 class="sub-title">Topological Progression Invariants:</h3>
    <ul style="margin: 2px 0 6px 18px; font-size: 8.4pt; line-height: 1.35;">
      <li><em>Gate Ingress:</em> Devotee checks in at Gate $k$ ($k \\in \\{1, 2, 3\\}$) ➔ token transitions from <code>waiting</code> to <code>checked_in</code>, advancing to Checkpoint $k$.</li>
      <li><em>Security Clearance:</em> Scanning at Checkpoint $k$ advances the token along $e = (\\text{CP}_k, \\text{Sanctum})$, converging into the Sanctum queue.</li>
      <li><em>Final Darshan:</em> Scanning at Sanctum completes the spiritual journey, marking token <code>status = 'completed'</code>.</li>
    </ul>

    <h2 class="section-title">Mathematical Formulation of the Queue Intelligence Engine</h2>
    <p>
      Unlike opaque machine learning models that produce erratic wait-time fluctuations, DarshanQ employs an explainable, deterministic formulation rooted in empirical queue velocity:
    </p>

    <div class="formula-callout">
      <strong>1. Rolling Empirical Scan Rate ($R_{scan}$):</strong>
      $$R_{scan}(c) = \\frac{\\sum_{i=1}^{M} \\mathbb{I}(\\text{scanned\\_at} \\ge T_{now} - 15\\text{ min})}{15}$$
      <em>Where $M$ is the count of scans logged in `checkpoint_logs` for station $c$ in the trailing 15-minute sliding window.</em>
    </div>

    <div class="formula-callout" style="margin-top: 5px;">
      <strong>2. Estimated Devotee Wait Time ($W$):</strong>
      $$W(\\tau) = \\max\\left(0, \\; \\left\\lceil \\frac{N_{ahead}(\\tau)}{\\max(R_{scan}(c), \\; 0.1)} \\right\\rceil \\right)$$
      <em>Where $N_{ahead}$ is the count of active tokens stationed at $c$ with token\\_number &lt; $\\tau$.token\\_number. Division by zero is safeguarded by clamping $\\min(R_{scan}) = 0.1$.</em>
    </div>

    <div class="formula-callout" style="margin-top: 5px;">
      <strong>3. Station Density Level ($D$):</strong>
      $$D(c) = \\begin{cases} 
        \\text{LOW (Green)}, & \\text{if } N_{waiting}(c) < 4 \\\\
        \\text{MODERATE (Amber)}, & \\text{if } 4 \\le N_{waiting}(c) < 8 \\\\
        \\text{HIGH (Red)}, & \\text{if } N_{waiting}(c) \\ge 8 
      \\end{cases}$$
    </div>
    """

    p13_md = """
## 4.2 Directed Graph Temple Topology & Queue Intelligence
Physical temple layout is modeled as a directed acyclic graph $G = (V, E)$, ensuring deterministic forward line-of-progression routing:

```
LEVEL 1 (Entry Gates):             [ Gate 1 ]         [ Gate 2 ]         [ Gate 3 ]
                                       │                  │                  │
                                       ▼                  ▼                  ▼
LEVEL 2 (Security Checkpoints):    [ Checkpoint 1 ]   [ Checkpoint 2 ]   [ Checkpoint 3 ]
                                       │                  │                  │
                                       └────────────────┬─┴──────────────────┘
                                                        ▼
LEVEL 3 (Sanctum Sanctorum):                       [ Sanctum ]
```

### Mathematical Queue Intelligence Formulation

**1. Rolling Empirical Scan Rate ($R_{scan}$):**
$$R_{scan}(c) = \\frac{\\sum_{i=1}^{M} \\mathbb{I}(\\text{scanned\\_at} \\ge T_{now} - 15\\text{ min})}{15}$$

**2. Estimated Wait Time ($W$):**
$$W(\\tau) = \\max\\left(0, \\; \\left\\lceil \\frac{N_{ahead}(\\tau)}{\\max(R_{scan}(c), \\; 0.1)} \\right\\rceil \\right)$$

**3. Station Density Thresholds ($D$):**
- **LOW (Green):** $N_{waiting}(c) < 4$
- **MODERATE (Amber):** $4 \\le N_{waiting}(c) < 8$
- **HIGH (Red):** $N_{waiting}(c) \\ge 8$
    """
    add_page(13, "Temple Flow Topology & Queue Math", p13_html, p13_md)

    # ----------------------------------------------------
    # PAGE 14: 4.3 RELATIONAL DATABASE SCHEMA & ER MODEL
    # ----------------------------------------------------
    p14_html = """
    <h2 class="section-title">4.3 Database Schema Design & Relational ER Modeling</h2>
    <p>
      The persistence tier is realized on PostgreSQL with foreign-key constraints enforcing referential integrity, automated UUID generation, and indexing on queue lookup vectors.
    </p>

    <table class="data-table" style="font-size: 7.4pt; line-height: 1.2;">
      <thead>
        <tr>
          <th>Table Name</th>
          <th>Primary Key</th>
          <th>Foreign Keys & Constraints</th>
          <th>Functional Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>users</strong></td>
          <td><code>id UUID</code></td>
          <td><code>phone UNIQUE</code>, <code>role IN ('devotee', 'staff', 'admin')</code></td>
          <td>Stores identity records, bcrypt hashes, and authorization scopes.</td>
        </tr>
        <tr>
          <td><strong>temples</strong></td>
          <td><code>id UUID</code></td>
          <td><code>name VARCHAR(150) NOT NULL</code></td>
          <td>Canonical repository of temple shrines and geographical metadata.</td>
        </tr>
        <tr>
          <td><strong>checkpoints</strong></td>
          <td><code>id UUID</code></td>
          <td><code>temple_id FK</code>, <code>next_checkpoint_id FK</code></td>
          <td>Models directed graph topology nodes, sequence order, and lane assignments.</td>
        </tr>
        <tr>
          <td><strong>queue_tokens</strong></td>
          <td><code>id UUID</code></td>
          <td><code>user_id FK</code>, <code>devotee_code UNIQUE</code>, <code>status CHECK</code></td>
          <td>Active virtual tokens, current station tracking, and wait time estimates.</td>
        </tr>
        <tr>
          <td><strong>checkpoint_logs</strong></td>
          <td><code>id UUID</code></td>
          <td><code>checkpoint_id FK</code>, <code>token_id FK</code>, <code>scanned_by FK</code></td>
          <td>Immutable audit ledger recording timestamps of every physical scan event.</td>
        </tr>
        <tr>
          <td><strong>crowd_snapshots</strong></td>
          <td><code>id UUID</code></td>
          <td><code>checkpoint_id FK</code>, <code>density_level CHECK</code></td>
          <td>Periodic historical snapshots of crowd density for analytics.</td>
        </tr>
        <tr>
          <td><strong>notifications</strong></td>
          <td><code>id UUID</code></td>
          <td><code>user_id FK</code>, <code>token_id FK</code>, <code>type CHECK</code></td>
          <td>Log of dispatched in-app alerts, proximity warnings, and Telegram messages.</td>
        </tr>
      </tbody>
    </table>

    <div class="diagram-panel">
RELATIONAL ENTITY RELATIONSHIP (ER) TOPOLOGY:
[users] (1) ───────────< (M) [queue_tokens] (M) >─────────── (1) [temples]
   │                                 │                             │
   │ (scanned_by)                    │ (current_station)           │
   ▼                                 ▼                             ▼
[checkpoint_logs] (M) >──────── [checkpoints] (M) ───────────< (1) [temples]
                                     │ (next_checkpoint_id)
                                     └──> Self-Referencing Topology
    </div>

    <p style="font-size: 8pt; margin-top: 5px;">
      <strong>Cascade Policies:</strong> Foreign keys referencing <code>temples</code> and <code>checkpoints</code> incorporate <code>ON DELETE CASCADE</code> to preserve integrity during topology restructuring, while <code>checkpoint_logs</code> maintains <code>ON DELETE SET NULL</code> to prevent historical audit loss.
    </p>
    """

    p14_md = """
## 4.3 Database Schema Design & Relational ER Modeling
The persistence tier is realized on PostgreSQL with foreign-key constraints enforcing referential integrity, automated UUID generation, and indexing on queue lookup vectors.

| Table Name | Primary Key | Foreign Keys & Constraints | Functional Purpose |
| :--- | :--- | :--- | :--- |
| **users** | `id UUID` | `phone UNIQUE`, `role CHECK` | Stores user credentials, hashed passwords, and roles. |
| **temples** | `id UUID` | `name NOT NULL` | Stores canonical temple shrine information. |
| **checkpoints** | `id UUID` | `temple_id FK`, `next_checkpoint_id FK` | Models directed graph nodes, lane, and sequence order. |
| **queue_tokens** | `id UUID` | `user_id FK`, `devotee_code UNIQUE` | Active virtual passes, station state, wait time estimates. |
| **checkpoint_logs**| `id UUID` | `checkpoint_id FK`, `token_id FK` | Immutable audit ledger recording timestamps of scans. |
| **crowd_snapshots**| `id UUID` | `checkpoint_id FK`, `density_level CHECK`| Historical snapshots of station crowd density. |
| **notifications** | `id UUID` | `user_id FK`, `token_id FK` | Dispatched alerts and proximity notifications. |

```
RELATIONAL ENTITY RELATIONSHIP (ER) TOPOLOGY:
[users] (1) ───────────< (M) [queue_tokens] (M) >─────────── (1) [temples]
   │                                 │                             │
[checkpoint_logs] (M) >──────── [checkpoints] (M) ───────────< (1) [temples]
                                     │ (next_checkpoint_id)
                                     └──> Self-Referencing Topology
```
    """
    add_page(14, "Database Schema Design & ER Modeling", p14_html, p14_md)

    # ----------------------------------------------------
    # PAGE 15: 4.4 CLASS & COMPONENT ARCHITECTURE
    # ----------------------------------------------------
    p15_html = """
    <h2 class="section-title">4.4 Object-Oriented Class & Frontend Component Architecture</h2>
    <p>
      DarshanQ adheres to the <em>Controller-Service-Repository</em> design pattern on the backend, complemented by a unidirectional, reactive component hierarchy on the frontend.
    </p>

    <div class="diagram-panel">
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVICE ARCHITECTURE                    │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   Route Handlers     │  │          Domain Services               │  │
│  │  - auth.js           │  │  - waitTimeEngine.js                   │  │
│  │  - tokens.js         ├──┼─>   * getScanRate(cpId)                │  │
│  │  - checkpoints.js    │  │   * estimateWaitTime(tokenId)          │  │
│  │  - admin.js          │  │   * getCheckpointDensity(cpId)         │  │
│  └──────────┬───────────┘  │   * recomputeAfterScan(cpId, templeId) │  │
│             │              │  - telegramBot.js                      │  │
│             ▼              │  - devoteeCode.js                      │  │
│  ┌──────────────────────┐  └────────────────────────────────────────┘  │
│  │  Middleware & Pool   │                       │                      │
│  │  - auth.js (JWT RBAC)│                       ▼                      │
│  │  - pool.js (pg Pool) │ <─────────────────────┘ (SQL Transactions)   │
│  └──────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND COMPONENT HIERARCHY                     │
│                                [ App.jsx ]                             │
│                                     │                                  │
│                     [ AuthContext.jsx ] (JWT Token State)              │
│                                     │                                  │
│        ┌────────────────────────────┼───────────────────────────┐      │
│        ▼                            ▼                           ▼      │
│ [ DevoteeHome.jsx ]         [ StaffPanel.jsx ]         [ AdminDashboard]│
│  - VirtualPassCard          - StationSelectorDrawer    - KPIStatCards  │
│  - RouteTracker             - TapToScanModal           - InspectorPanel│
│  - ExplainabilityCard       - RapidPassCounter         - DevoteeLookup │
│        │                            │                           │      │
│        └────────────────────────────┼───────────────────────────┘      │
│                                     ▼                                  │
│                          [ TempleFlowMap.jsx ]                         │
│              (Interactive SVG Topology & Dynamic Density Glow)         │
└────────────────────────────────────────────────────────────────────────┘
    </div>

    <p style="font-size: 8.2pt;">
      <strong>Design Decoupling:</strong> The visual topology map component (<code>TempleFlowMap.jsx</code>) is completely decoupled from business logic, functioning as a pure presentation layer that accepts station metrics, density thresholds, and selection callbacks across all portals.
    </p>
    """

    p15_md = """
## 4.4 Object-Oriented Class & Frontend Component Architecture
DarshanQ adheres to the *Controller-Service-Repository* design pattern on the backend, complemented by a unidirectional, reactive component hierarchy on the frontend.

```
BACKEND SERVICE ARCHITECTURE:
Route Handlers ──────> Domain Services (waitTimeEngine, telegramBot)
(auth, tokens,         │
 checkpoints, admin)   ▼
        │          Database Pool (pg.Pool with SSL)
        ▼
Middleware (JWT RBAC)

FRONTEND COMPONENT HIERARCHY:
                  [ App.jsx ]
                       │
             [ AuthContext.jsx ] (JWT State)
                       │
  ┌────────────────────┼────────────────────┐
  ▼                    ▼                    ▼
[DevoteeHome]    [StaffPanel]    [AdminDashboard]
  │                    │                    │
  └────────────────────┼────────────────────┘
                       ▼
             [ TempleFlowMap.jsx ]
  (Shared SVG Directed Topology & Density Heatmap)
```
    """
    add_page(15, "Class & Component Architecture", p15_html, p15_md)

    # ----------------------------------------------------
    # PAGE 16: 4.5 SYSTEM SEQUENCE DIAGRAMS
    # ----------------------------------------------------
    p16_html = """
    <h2 class="section-title">4.5 System Sequence Diagrams</h2>
    <h3 class="sub-title">Sequence 1: Devotee Virtual Token Booking Flow</h3>
    <div class="diagram-panel">
Devotee Client              Express API Server           PostgreSQL DB          Socket.IO Engine
      │                              │                          │                      │
      │── 1. POST /api/tokens ──────>│                          │                      │
      │   (temple_id, gate_id)       │── 2. Verify Active Token>│                      │
      │                              │<─ 3. No Existing Token ──│                      │
      │                              │                          │                      │
      │                              │── 4. Generate Token & ──>│                      │
      │                              │      Assign Gate & Code  │                      │
      │                              │<─ 5. Insert Confirmed ───│                      │
      │                              │                          │                      │
      │                              │── 6. Query Wait Engine ─>│                      │
      │                              │<─ 7. Wait & Velocity ────│                      │
      │                              │                          │                      │
      │<─ 8. 201 Created (Token) ────│                          │                      │
      │                              │── 9. emit('queue:update')──────────────────────>│
      │                              │                                                 │──> Devotee
    </div>

    <h3 class="sub-title">Sequence 2: Staff Checkpoint Scan & Real-Time Broadcast Flow</h3>
    <div class="diagram-panel">
Staff Terminal              Express API Server           PostgreSQL DB          Socket.IO Broadcast
      │                              │                          │                      │
      │── 1. POST /cp/:id/scan ─────>│                          │                      │
      │   (token_id / +1 Tap)        │── 2. Fetch Topo Node ───>│                      │
      │                              │<─ 3. Next Checkpoint ID ─│                      │
      │                              │                          │                      │
      │                              │── 4. Advance Token State>│                      │
      │                              │      & Insert Audit Log  │                      │
      │                              │<─ 5. Tx Committed ───────│                      │
      │                              │                          │                      │
      │                              │── 6. recomputeAfterScan─>│                      │
      │                              │<─ 7. Updated Metrics ────│                      │
      │                              │                          │                      │
      │<─ 8. 200 OK (Scan Complete) ─│                          │                      │
      │                              │── 9. emit('density:update') ───────────────────>│──> Admin / Staff
      │                              │── 10. emit('queue:update') ────────────────────>│──> Devotee Rooms
      │                              │── 11. emit('token:approaching') ───────────────>│──> Next Devotee
    </div>
    """

    p16_md = """
## 4.5 System Sequence Diagrams

### Sequence 1: Devotee Virtual Token Booking Flow
```
Devotee Client       Express API Server         PostgreSQL DB        Socket.IO Engine
     │                        │                        │                    │
     │── POST /api/tokens ───>│                        │                    │
     │                        │── Check Active Token ─>│                    │
     │                        │<─ None Found ──────────│                    │
     │                        │── Insert Token/Code ──>│                    │
     │                        │<─ Confirmed ───────────│                    │
     │                        │── Compute Wait Time ──>│                    │
     │<─ 201 Created (Token) ─│                        │                    │
     │                        │── emit('queue:update')─────────────────────>│──> Devotee
```

### Sequence 2: Staff Checkpoint Scan & Real-Time Broadcast Flow
```
Staff Terminal       Express API Server         PostgreSQL DB        Socket.IO Broadcast
     │                        │                        │                    │
     │── POST /cp/:id/scan ──>│                        │                    │
     │                        │── Advance Topology ───>│                    │
     │                        │── Insert Audit Log ───>│                    │
     │                        │<─ Tx Committed ────────│                    │
     │                        │── Recompute Engine ───>│                    │
     │<─ 200 OK (Advanced) ───│                        │                    │
     │                        │── emit('density:update') ──────────────────>│──> Staff/Admin
     │                        │── emit('queue:update') ────────────────────>│──> Devotees
     │                        │── emit('token:approaching') ───────────────>│──> Next In Line
```
    """
    add_page(16, "System Sequence Diagrams", p16_html, p16_md)
