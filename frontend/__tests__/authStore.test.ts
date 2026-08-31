import { useAuthStore } from "../store/authStore";

describe("useAuthStore (critical auth flow)", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: "idle" });
  });

  it("starts in the idle, unauthenticated state", () => {
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.status).toBe("idle");
  });

  it("sets authenticated status when a user logs in", () => {
    const user = {
      id: "u1",
      name: "Farmer",
      role: "farmer" as const,
      preferredLanguage: "en" as const,
      isActive: true,
      createdAt: "2026-01-01",
    };
    useAuthStore.getState().setUser(user);

    const s = useAuthStore.getState();
    expect(s.user).toEqual(user);
    expect(s.status).toBe("authenticated");
  });

  it("returns to unauthenticated on logout (setUser(null))", () => {
    useAuthStore.setState({
      user: { id: "u1", name: "Farmer", role: "farmer", preferredLanguage: "en", isActive: true, createdAt: "2026-01-01" },
    });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("exposes loading status via setStatus", () => {
    useAuthStore.getState().setStatus("loading");
    expect(useAuthStore.getState().status).toBe("loading");
  });
});
