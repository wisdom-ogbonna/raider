import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#0066FF',
  primaryLight: '#E6F0FF',
  text: '#222',
  textMuted: '#666',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  border: '#E1E8ED',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ===== Map Section =====
  mapWrapper: {
    flex: 1,
    marginVertical: 8,
    marginTop: 48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -36,
    zIndex: 10,
  },

  // ===== Input Fields =====
  input: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: 10,
  },

  // ===== Buttons =====
  button: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    elevation: 2,
    alignSelf: 'center',
    minWidth: 150,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  mapTypeButton: {
    marginTop: 10,
    alignSelf: 'center',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
  },

  // ===== Text =====
  reportedAddress: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // ===== Preview Image =====
  previewImage: {
    width: '100%',
    height: 150,
    marginVertical: 10,
    borderRadius: 14,
    borderColor: COLORS.border,
    borderWidth: 1,
  },

  // ===== Interaction Section =====
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: COLORS.primaryLight,
    padding: 6,
    borderRadius: 8,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionEmoji: {
    fontSize: 20,
    marginHorizontal: 4,
  },

  // ===== Category Dropdown =====
  categoryContainer: {
    marginHorizontal: 10,
    marginTop: 8,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.text,
  },
  categoryButton: {
    borderColor: COLORS.primary,
    borderWidth: 1.2,
    borderRadius: 10,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  categoryButtonContent: {
    justifyContent: 'flex-start',
    height: 42,
  },
  categoryButtonLabel: {
    color: COLORS.primary,
    fontSize: 14,
  },
  categoryMenu: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 8,
    marginHorizontal: 8,
    elevation: 3,
  },
  menuItem: {
    backgroundColor: 'transparent',
  },
  menuItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  menuItemTitle: {
    color: COLORS.text,
    fontWeight: '400',
    fontSize: 14,
  },
  menuItemTitleSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
