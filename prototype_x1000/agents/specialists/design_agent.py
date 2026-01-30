"""Design Agent - UI/UX and visual design specialist."""

from typing import Any, Optional

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.memory_client import SupabaseMemoryClient


class DesignAgent(BaseAgent):
    """Design specialist agent.

    Handles:
    - UI/UX design and user experience
    - Visual identity and branding
    - Component design and design systems
    - User research and personas
    - Information architecture
    - User flows and journey mapping
    - Accessibility (WCAG compliance)
    - Mobile/responsive design patterns

    Uses the Design Brain guidance for all decisions.
    """

    AGENT_TYPE = "design"
    BRAIN_NAME = "design"
    DEFAULT_MODEL = "claude-sonnet-4-20250514"

    # Design modes from Design Brain
    DESIGN_MODES = {
        "saas": "Customer-facing SaaS products. Conversion, retention, trust prioritized.",
        "internal": "Internal tools, admin panels. Efficiency > marketing. High density allowed.",
        "agentic": "Agent tools, automation UIs. Explainability and state clarity prioritized.",
    }

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
        design_mode: str = "saas",
    ):
        """Initialize the Design agent.

        Args:
            model: Model to use. Defaults to claude-sonnet-4.
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            auto_log: Whether to auto-log runs.
            design_mode: Design mode (saas, internal, agentic).
        """
        super().__init__(
            model=model,
            api_key=api_key,
            memory_client=memory_client,
            auto_log=auto_log,
        )

        self.design_mode = design_mode
        self._register_design_tools()

    def _get_agent_instructions(self) -> str:
        """Return design-specific instructions."""
        mode_desc = self.DESIGN_MODES.get(self.design_mode, self.DESIGN_MODES["saas"])

        return f"""You are the Design Agent - a senior product designer and UI engineer specialist.

Current Design Mode: {self.design_mode.upper()}
{mode_desc}

Your capabilities:
- Create UI/UX designs and specifications
- Design component systems and style guides
- Define information architecture
- Map user flows and journeys
- Create personas based on research
- Ensure WCAG accessibility compliance
- Design for mobile-first and responsive

Rules (from Design Brain):
- Clarity beats clever
- Fewer elements, stronger hierarchy
- One primary action per screen
- Spacing before decoration
- Color only for meaning
- No visual noise
- No placeholder or hype copy

Required UI States (every screen MUST include):
- Default
- Loading
- Empty
- Error
- Success

Tools available:
- create_component_spec: Generate component specification
- create_design_tokens: Define design tokens (colors, typography, spacing)
- create_screen_spec: Design a screen with all states
- create_user_flow: Map user journey
- call_engineering_brain: Delegate technical questions
- log_design_dna: Save design system to memory

Output format:
- Use markdown for specifications
- Include all required states
- Specify responsive breakpoints
- Document accessibility requirements
"""

    def _register_design_tools(self) -> None:
        """Register design-specific tools."""
        self.register_tool(
            name="create_component_spec",
            description="Generate a detailed component specification",
            input_schema={
                "type": "object",
                "properties": {
                    "component_name": {
                        "type": "string",
                        "description": "Name of the component",
                    },
                    "purpose": {
                        "type": "string",
                        "description": "What the component is for",
                    },
                    "variants": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of component variants",
                    },
                },
                "required": ["component_name", "purpose"],
            },
            handler=self._create_component_spec,
        )

        self.register_tool(
            name="create_design_tokens",
            description="Define design tokens for a project",
            input_schema={
                "type": "object",
                "properties": {
                    "project_name": {
                        "type": "string",
                        "description": "Name of the project",
                    },
                    "color_palette": {
                        "type": "object",
                        "description": "Color definitions",
                    },
                    "typography": {
                        "type": "object",
                        "description": "Typography scale",
                    },
                    "spacing": {
                        "type": "object",
                        "description": "Spacing tokens",
                    },
                },
                "required": ["project_name"],
            },
            handler=self._create_design_tokens,
        )

        self.register_tool(
            name="create_screen_spec",
            description="Design a screen with all required states",
            input_schema={
                "type": "object",
                "properties": {
                    "screen_name": {
                        "type": "string",
                        "description": "Name of the screen",
                    },
                    "purpose": {
                        "type": "string",
                        "description": "What the screen is for",
                    },
                    "primary_action": {
                        "type": "string",
                        "description": "The main action on this screen",
                    },
                },
                "required": ["screen_name", "purpose", "primary_action"],
            },
            handler=self._create_screen_spec,
        )

        self.register_tool(
            name="call_engineering_brain",
            description="Delegate a technical question to Engineering agent",
            input_schema={
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The technical question",
                    },
                    "context": {
                        "type": "string",
                        "description": "Design context",
                    },
                },
                "required": ["question"],
            },
            handler=self._call_engineering_brain,
        )

        self.register_tool(
            name="log_design_dna",
            description="Save design system to Supabase memory",
            input_schema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Project identifier",
                    },
                    "project_name": {
                        "type": "string",
                        "description": "Human-readable project name",
                    },
                    "color_tokens": {
                        "type": "object",
                        "description": "Color palette",
                    },
                    "typography_scale": {
                        "type": "object",
                        "description": "Typography definitions",
                    },
                    "spacing_tokens": {
                        "type": "object",
                        "description": "Spacing system",
                    },
                    "signature_move": {
                        "type": "string",
                        "description": "Unique design characteristic",
                    },
                },
                "required": ["project_id", "project_name"],
            },
            handler=self._log_design_dna,
        )

    def _create_component_spec(
        self,
        component_name: str,
        purpose: str,
        variants: Optional[list[str]] = None,
    ) -> str:
        """Generate a component specification.

        Args:
            component_name: Name of the component.
            purpose: What the component does.
            variants: List of variants.

        Returns:
            Component specification markdown.
        """
        variants = variants or ["default"]

        spec = f"""# {component_name} Component Specification

## Purpose
{purpose}

## Variants
{chr(10).join(f'- {v}' for v in variants)}

## States
- **Default**: Normal interactive state
- **Hover**: On mouse hover
- **Active**: While being clicked/pressed
- **Focus**: Keyboard focus (must have visible ring)
- **Disabled**: Non-interactive state
- **Loading**: When processing

## Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus visible indicator

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Component variant |
| disabled | boolean | false | Disable interaction |
| loading | boolean | false | Show loading state |

## Usage
```tsx
<{component_name} variant="default" />
```
"""
        return spec

    def _create_design_tokens(
        self,
        project_name: str,
        color_palette: Optional[dict] = None,
        typography: Optional[dict] = None,
        spacing: Optional[dict] = None,
    ) -> str:
        """Create design tokens for a project.

        Args:
            project_name: Project name.
            color_palette: Color definitions.
            typography: Typography scale.
            spacing: Spacing tokens.

        Returns:
            Design tokens markdown.
        """
        tokens = f"""# {project_name} Design Tokens

## Colors
"""
        if color_palette:
            for name, value in color_palette.items():
                tokens += f"- `--color-{name}`: {value}\n"
        else:
            tokens += """- `--color-primary`: #2563EB
- `--color-secondary`: #64748B
- `--color-success`: #22C55E
- `--color-warning`: #F59E0B
- `--color-error`: #EF4444
- `--color-background`: #FFFFFF
- `--color-surface`: #F8FAFC
- `--color-text`: #0F172A
- `--color-text-muted`: #64748B
"""

        tokens += "\n## Typography\n"
        if typography:
            for name, value in typography.items():
                tokens += f"- `--font-{name}`: {value}\n"
        else:
            tokens += """- `--font-family`: 'Inter', system-ui, sans-serif
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
"""

        tokens += "\n## Spacing\n"
        if spacing:
            for name, value in spacing.items():
                tokens += f"- `--space-{name}`: {value}\n"
        else:
            tokens += """- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-12`: 3rem (48px)
"""

        return tokens

    def _create_screen_spec(
        self,
        screen_name: str,
        purpose: str,
        primary_action: str,
    ) -> str:
        """Design a screen specification.

        Args:
            screen_name: Name of the screen.
            purpose: What the screen does.
            primary_action: Main action on the screen.

        Returns:
            Screen specification markdown.
        """
        return f"""# {screen_name} Screen Specification

## Purpose
{purpose}

## Primary Action
**{primary_action}** - This is the most prominent interactive element.

## Layout Structure
```
┌────────────────────────────────────┐
│ Header / Navigation                │
├────────────────────────────────────┤
│                                    │
│                                    │
│         Main Content Area          │
│                                    │
│                                    │
├────────────────────────────────────┤
│ [Primary Action Button]            │
└────────────────────────────────────┘
```

## Required States

### 1. Default State
- Primary content is visible
- Primary action is prominent and enabled
- Secondary actions are available but de-emphasized

### 2. Loading State
- Show skeleton loaders for content
- Primary action shows loading spinner
- Disable interactions during load

### 3. Empty State
- Friendly illustration or icon
- Clear message: "No [items] yet"
- Call-to-action to add first item

### 4. Error State
- Clear error message (not technical)
- Suggested resolution
- Retry action available

### 5. Success State
- Confirmation message
- Next steps or return action
- Auto-dismiss after 3s (optional)

## Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (two columns)
- Desktop: > 1024px (full layout)

## Accessibility
- [ ] Logical heading hierarchy
- [ ] Skip to main content link
- [ ] Form labels associated
- [ ] Error messages linked to inputs
- [ ] Color is not only indicator
"""

    def _call_engineering_brain(
        self,
        question: str,
        context: Optional[str] = None,
    ) -> str:
        """Delegate a technical question to Engineering agent.

        Args:
            question: The technical question.
            context: Design context.

        Returns:
            Engineering agent response.
        """
        try:
            from .engineering_agent import EngineeringAgent

            eng_agent = EngineeringAgent(
                api_key=self.api_key,
                memory_client=self._memory_client,
            )

            full_prompt = f"Design context: {context}\n\nQuestion: {question}" if context else question
            result = eng_agent.run(full_prompt)

            return result.content if result.success else f"Engineering brain error: {result.error}"

        except Exception as e:
            return f"Failed to call engineering brain: {str(e)}"

    def _log_design_dna(
        self,
        project_id: str,
        project_name: str,
        color_tokens: Optional[dict] = None,
        typography_scale: Optional[dict] = None,
        spacing_tokens: Optional[dict] = None,
        signature_move: Optional[str] = None,
    ) -> str:
        """Save design system to Supabase.

        Args:
            project_id: Project identifier.
            project_name: Human-readable name.
            color_tokens: Color palette.
            typography_scale: Typography definitions.
            spacing_tokens: Spacing system.
            signature_move: Unique characteristic.

        Returns:
            Success message or error.
        """
        if not self._memory_client:
            return "Memory client not available - design DNA not saved"

        try:
            import json
            from uuid import uuid4

            data = {
                "id": str(uuid4()),
                "project_id": project_id,
                "project_name": project_name,
                "color_tokens": json.dumps(color_tokens or {}),
                "typography_scale": json.dumps(typography_scale or {}),
                "spacing_tokens": json.dumps(spacing_tokens or {}),
                "signature_move": signature_move,
            }

            self._memory_client.client.table("design_dna").insert(data).execute()
            return f"Design DNA saved for {project_name}"

        except Exception as e:
            return f"Failed to save design DNA: {str(e)}"

    def set_design_mode(self, mode: str) -> None:
        """Change the design mode.

        Args:
            mode: New design mode (saas, internal, agentic).
        """
        if mode in self.DESIGN_MODES:
            self.design_mode = mode
            # Clear cached system prompt
            self._system_prompt = None
        else:
            raise ValueError(f"Invalid design mode: {mode}. Use: {list(self.DESIGN_MODES.keys())}")
