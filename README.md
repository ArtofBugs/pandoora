# pandoora

A task app with a focus on rewarding yourself after working hard, avoiding the distraction of dreading future work, and visualizing all of it.

## Setup

## Using the App



## Planned Features
- Tasks
  - Reward amount dot - red, orange, yellow
    - Accumulate dots for reward blocks
    - Configuration for ratio between dot amounts
  - Estimated number of blocks for the task
    - Compare to actual number of blocks used on that task
      - Future: allow partial blocks if the task was finished early
      - Future: allow manually editing number of blocks used
  - Due date
  - Description (good place to put links to instructions, resources, drafting docs needed - so you don't need to go find all the pages to open for the task)
  - Future: different colors/categories for tasks
    - Should colors/categories be global (assignable to any task, event, block, etc.) or defined for each type?
    - Allow multiple colors/categories for one task
  - Future: keep a history of the number of focus blocks and the planned times for each task, as well as the actual final number of blocks it took and when
    - Future of the future: color-coding for tasks to show whether they were finished early, on-time, or later than planned (or if plans were shifted)
    - Option to increase reward for finishing early or decrease reward for finishing late
- Set event: a task that happens at a set time in the day (e.g., a synchronous class, a meeting, etc.)
  - Can have a reward amount, but not required
  - Can have block estimate, but not required
  - Start time
  - Can have end time
  - Description
  - Future: colors/categories
- Focus blocks: a block of time dedicated to work
  - Configure the amount of time in each block (e.g., one hour, half an hour)
    - Future: if the time per block changes, only change it for future blocks; provide an indicator/note?
  - Configure the number of blocks you need to work each day or week; manually editable per week/day
    - Keep a store of focus blocks for the week and assign a number of blocks to each day, or keep a store of focus blocks for the day and assign a number of blocks to each hour/time period
  - Assign a task to a focus block when it is time to activate it
    - Future: allow assigning tasks to focus blocks ahead of time
      - This changes the color/category of the focus block to the same as the task itself
    - Future: allow assigning a color/category ahead of time
    - Future: YouTube and/or Spotify integration (need to read about their APIs) to assign music to a focus block or chunk of focus blocks
      - Future of the future: add an option to randomly pick from a user-configured playlist (or playlists, e.g. for different genres or lengths of music) so less time is wasted looking for music
- Reward block: a block of time dedicated to fun/rewards
  - Configure the amount of time in each block
  - Optionally assign an activity name to the block
    - Future: keep a list of fun activities reserved for reward blocks and add an option to randomly draw an activity from the list
  - Future: allow assigning a color/category ahead of time
- Active block: focus block or reward block
  - Focus block:
    - Choose a task to assign to the focus block (or edit if already assigned)
    - Option to enable lock (lock visibility of tasks, progress, etc.) during focus block (the inspiration for the name :))
- Calendar view: view of all progress made so far 
  - Show focus blocks assigned each day
  - Sidebar to show focus and reward blocks not yet assigned
    - Includes blocks assigned in the past but not used
  - Sidebar to show tasks not yet assigned to days and/or focus blocks
    - Future: allow assigning tasks to a period (days or hours) first
- Locked view: screen to block off calendar view
  - Hide calendar view during a focus block if locking is enabled
  - Hide calendar view during a reward block if locking is enabled
  - Expandable to show details of active task/reward
    - Links should be clickable!
  - Expandable to show amount of time remaining before unlock
  - Future: configure appearance of locked screen (clock/countdown to end of block? wallpaper? how much of the task details?)
  - Configure a long passphrase to enter to unlock in emergencies
- Future: planned work periods for the day + progress bar based on current time
- Future: export current state (including tasks, blocks, etc.) to JSON
  - Allow batch movement to future after an import (i.e. moving every task to a current/future time since the backup was probably created in the past)
