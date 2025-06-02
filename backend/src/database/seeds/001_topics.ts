import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('topics').del();

  // Insert nuclear engineering topics
  await knex('topics').insert([
    {
      slug: 'basic-energy-concepts',
      name: 'Basic Energy Concepts',
      description: 'Fundamental energy principles and concepts',
      category: 'physics',
      question_count: 2
    },
    {
      slug: 'breakers-relays-disconnects',
      name: 'Bkrs, Rlys, and Disconnects',
      description: 'Electrical breakers, relays, and disconnect devices',
      category: 'electrical',
      question_count: 119
    },
    {
      slug: 'control-rods',
      name: 'Control Rods',
      description: 'Nuclear reactor control rod systems and operations',
      category: 'reactor-systems',
      question_count: 37
    },
    {
      slug: 'controllers-positioners',
      name: 'Controllers and Positioners',
      description: 'Control systems and valve positioners',
      category: 'instrumentation',
      question_count: 112
    },
    {
      slug: 'core-thermal-limits',
      name: 'Core Thermal Limits',
      description: 'Reactor core thermal and safety limits',
      category: 'reactor-physics',
      question_count: 19
    },
    {
      slug: 'demins-ion-exchange',
      name: 'Demins and Ion Exchange',
      description: 'Demineralizer and ion exchange systems',
      category: 'chemistry',
      question_count: 37
    },
    {
      slug: 'fluid-statics-dynamics',
      name: 'Fluid Statics and Dynamics',
      description: 'Fluid mechanics, statics, and dynamics',
      category: 'mechanical',
      question_count: 73
    },
    {
      slug: 'heat-exchangers',
      name: 'Heat Exchangers',
      description: 'Heat transfer equipment and operations',
      category: 'mechanical',
      question_count: 61
    },
    {
      slug: 'heat-transfer',
      name: 'Heat Transfer',
      description: 'Heat transfer principles and applications',
      category: 'thermodynamics',
      question_count: 12
    },
    {
      slug: 'motors-generators',
      name: 'Motors and Generators',
      description: 'Electric motors and generators',
      category: 'electrical',
      question_count: 105
    },
    {
      slug: 'neutron-life-cycle',
      name: 'Neutron Life Cycle',
      description: 'Neutron physics and life cycle',
      category: 'reactor-physics',
      question_count: 31
    },
    {
      slug: 'neutrons',
      name: 'Neutrons',
      description: 'Neutron behavior and interactions',
      category: 'reactor-physics',
      question_count: 20
    },
    {
      slug: 'pumps',
      name: 'Pumps',
      description: 'Pump systems and operations',
      category: 'mechanical',
      question_count: 174
    },
    {
      slug: 'reactivity-coefficients',
      name: 'Reactivity Coefficients',
      description: 'Reactor reactivity feedback mechanisms',
      category: 'reactor-physics',
      question_count: 23
    },
    {
      slug: 'reactor-kinetics-neutron-sources',
      name: 'Reactor Kinetics and Neutron Sources',
      description: 'Reactor kinetics and neutron source behavior',
      category: 'reactor-physics',
      question_count: 66
    },
    {
      slug: 'reactor-operational-physics',
      name: 'Reactor Operational Physics',
      description: 'Reactor physics in operational context',
      category: 'reactor-physics',
      question_count: 97
    },
    {
      slug: 'sensors-detectors',
      name: 'Sensors and Detectors',
      description: 'Instrumentation sensors and detection systems',
      category: 'instrumentation',
      question_count: 172
    },
    {
      slug: 'thermal-hydraulics',
      name: 'Thermal Hydraulics',
      description: 'Thermal-hydraulic analysis and systems',
      category: 'thermodynamics',
      question_count: 28
    },
    {
      slug: 'thermodynamic-cycles',
      name: 'Thermodynamic Cycles',
      description: 'Power generation thermodynamic cycles',
      category: 'thermodynamics',
      question_count: 3
    },
    {
      slug: 'thermodynamic-processes',
      name: 'Thermodynamic Processes',
      description: 'Thermodynamic process fundamentals',
      category: 'thermodynamics',
      question_count: 2
    },
    {
      slug: 'thermodynamic-units-properties',
      name: 'Thermodynamic Units and Properties',
      description: 'Thermodynamic units, properties, and measurements',
      category: 'thermodynamics',
      question_count: 24
    },
    {
      slug: 'valves',
      name: 'Valves',
      description: 'Valve systems and operations',
      category: 'mechanical',
      question_count: 102
    }
  ]);
}